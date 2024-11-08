import {KafkaService} from "./KafkaService";
import {GenAiService} from "./genAiService";

export class TextService {
    private static timer: any = null;

    public static onSendText(text:string) {}
    public static onSendTranslatedText(translatedText:string) {}

    private static textTimer: any = null;
    private static onSendTextAndCleanUp(text:string) {
        TextService.onSendText(text);
        if(TextService.textTimer){
            clearTimeout(TextService.textTimer);
        }
        TextService.textTimer = setTimeout(()=>{
            TextService.onSendText('');
        }, 20000);
    }

    private static translatedTextTimer: any = null;
    private static onSendTranslatedTextAndCleanUp(translatedText:string) {
        TextService.onSendTranslatedText(translatedText);
        if(TextService.translatedTextTimer){
            clearTimeout(TextService.translatedTextTimer);
        }
        TextService.translatedTextTimer = setTimeout(()=>{
            TextService.onSendTranslatedText('');
        }, 20000);
    }
    public static async onGenerateContent(text:string) {
        return ''
    }

    private shouldTranslate(text: string) {
        return text.match(/[ก-๙]/);
    }

    private static clearTimer(){
        if(TextService.timer){
            clearTimeout(TextService.timer);
        }
    }

    private static async sendTranslatedMessage(text: string, confidence: number, translatedText: string) {
        GenAiService.getToken(text).then((token)=>{
            KafkaService.sendTranslatedMessage({
                text: text,
                textConfidence: confidence,
                translatedText: translatedText,
                token: token
            }).catch(console.error);
        })
    }

    public setText(newText: string, confidence: number) {
        TextService.onSendTextAndCleanUp(newText);
        TextService.clearTimer();
        TextService.timer = setTimeout(()=>{
            TextService.onGenerateContent(newText).then((translatedText)=>{
                    TextService.onSendTranslatedTextAndCleanUp(translatedText);
                    TextService.sendTranslatedMessage(newText, confidence, translatedText).catch(console.error);
                });
            }, 500);
    }
}