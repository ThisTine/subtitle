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

    public setText(newText: string){
        TextService.onSendTextAndCleanUp(newText);
        TextService.clearTimer();
        TextService.timer = setTimeout(()=>{
            TextService.onGenerateContent(newText).then((translatedText)=>{
                    TextService.onSendTranslatedTextAndCleanUp(translatedText);
                });
            }, 500);
    }
}