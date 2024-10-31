import speech from "@google-cloud/speech";

export class StreamRecognitionService {
    private static speechToText: any = null;
    public static streamRecognition: any = null;
    public static languageCode: string = 'th-TH';

    constructor() {
        StreamRecognitionService.speechToText = new speech.SpeechClient({
            apiKey: process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY
        });
    }

    public static onSetText(text: string, confidence: number) {
    }

    public static changeLanguageCode(languageCode: string) {
        if(languageCode !== StreamRecognitionService.languageCode) {
            StreamRecognitionService.languageCode = languageCode;
            StreamRecognitionService.buildStreamRecognition();
        }
    }

    public static buildStreamRecognition() {
        try{
            StreamRecognitionService.streamRecognition =  StreamRecognitionService.speechToText.streamingRecognize({
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 16000,
                    languageCode: StreamRecognitionService.languageCode,
                    // enableAutomaticPunctuation: true,
                    // enableWordTimeOffsets: true,
                    enableSpeakerDiarization: true,
                    diarizationSpeakerCount: 2,
                    model: "latest_long",
                },
                interimResults: true,
            }).on('data', (data:any) => {
                if(data.results[0] && data.results[0].alternatives[0]) {
                    let result = data.results[0].alternatives[0].transcript;
                    StreamRecognitionService.onSetText(result, data.results[0].alternatives[0].confidence);
                }
            }).on('error', (e:any)=>{
                console.error(e);
                this.buildStreamRecognition();
            })
        }catch (e) {
            console.error(e);
        }
    }
}