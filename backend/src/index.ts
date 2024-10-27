import {Server, Socket} from 'socket.io';
import {
    buildDisplayResult,
    buildMicNotification,
    displayResults,
    micActions,
    micNotifications,
    socketEvents,
    TMicAction
} from "./enums";
import {TextService} from "./textService";
import {GenAiService} from "./genAiService";
import {StreamRecognitionService} from "./streamRecognitionService";
import firebase from "firebase/compat";
import {FirebaseService} from "./firebaseService";


// Initialize Firebase


(async () => {
    if(process.env.NODE_ENV !== 'production'){
        require('dotenv').config()
    }
    new FirebaseService();
    await FirebaseService.initFeatureFlag();
    const io = new Server({
        path: '/api/socket.io',
    });

    let mic: Socket | null = null;
    const textService = new TextService();
    const genAiService = new GenAiService();
    const streamRecognitionService = new StreamRecognitionService();

    StreamRecognitionService.onSetText = textService.setText

    TextService.onSendText = (text: string)=>{
        io.emit(socketEvents.DISPLAYRESULT, buildDisplayResult(displayResults.LIVETEXT, text));
    }

    TextService.onSendTranslatedText = (translatedText: string)=>{
        io.emit(socketEvents.DISPLAYRESULT, buildDisplayResult(displayResults.TRANSLATEDTEXT, translatedText));
    }

    TextService.onGenerateContent = genAiService.genText;

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            if(mic && mic.id === socket.id){
                mic = null;
                StreamRecognitionService.streamRecognition?.destroy()
            }
        });

        socket.on(socketEvents.MICACTION,(data: TMicAction)=>{
            switch (data.action) {
                case micActions.SETMIC:
                    if(mic){
                        socket.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.MICALREADYINUSE, 'Mic is already in use'));
                        return;
                    }
                    mic = socket;
                    StreamRecognitionService.buildStreamRecognition();
                    socket.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.SETMICSUCCESS, 'Mic is set'));
                    break;
                case micActions.REPLACEMIC:
                    if(mic){
                        mic.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.MICREPLACED, 'Mic is replaced'));
                        mic.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.INFO, 'Mic is replaced'));
                    }
                    StreamRecognitionService.buildStreamRecognition();
                    socket.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.SETMICSUCCESS, 'Mic is set'));
                    mic = socket;
                    break;
            }
        })

        socket.on(socketEvents.MICSENDAUDIO, (data) => {
            if(FirebaseService.getDisableSubtitle()){
                return;
            }
            if(!mic){
                socket.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.ERROR, 'Mic is not in use'));
                return;
            }
            if(mic.id !== socket.id){
                socket.emit(socketEvents.MICNOTIFICATION, buildMicNotification(micNotifications.ERROR, 'Send audio is not allowed'));
                return;
            }
            const code = FirebaseService.getLanguageCode()
            StreamRecognitionService.changeLanguageCode(code);
            if(StreamRecognitionService.streamRecognition){
                StreamRecognitionService.streamRecognition.write(data);
            }
        })

    })


    io.listen(3000);
})();

