import {
    ChatSession,
    GenerativeModel,
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
} from "@google/generative-ai";
import {FirebaseService} from "./firebaseService";

export class GenAiService{
    private static genAi: GoogleGenerativeAI | null = null;
    private static model: GenerativeModel | null = null;
    private static chat: ChatSession | null = null;
    private static additionalInstruction: string = "";
    private static isUseAdditionalInstruction: boolean = false;
    private static modelCfg = "gemini-1.5-flash";
    private static _systemInstruction: string = `
    You are a translator at Google's DevFest Cloud Bangkok event. This event is a technology conference that focuses on Google Cloud technologies.
    Your job is to translate the speakers' presentations from Thai to English. Please help output the translated text in the chat box. Response with "****" if you are unable to translate the text.
     `;
    private static get systemInstruction(){
        if (FirebaseService.getUseAdditionalPrompt()){
            return GenAiService._systemInstruction + GenAiService.additionalInstruction;
        }
        return GenAiService._systemInstruction;
    }

    private static initGenAi(){
        GenAiService.genAi = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY ?? "");
        GenAiService.model = GenAiService.genAi.getGenerativeModel({
            model: GenAiService.modelCfg,
            systemInstruction: GenAiService.systemInstruction,
        });
        GenAiService.chat = GenAiService.model.startChat({
            safetySettings:[
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
            ]
        });
    }

    constructor(){
        GenAiService.initGenAi();
    }

    public static setAdditionalInstruction(instruction: string){
        GenAiService.additionalInstruction = instruction
        GenAiService.initGenAi()
    }

    public static async getToken(text: string){
        try{
            const countResult = await GenAiService.model?.countTokens(text);
            if (countResult){
                return countResult.totalTokens;
            }
            return 0
        }catch (e) {
            console.error(e);
            return 0;
        }
    }

    public async genText(text: string){
        {
            try{
                if (FirebaseService.getDisableTranslate()) {
                    return "";
                }
                if(FirebaseService.getUseAdditionalPrompt() != GenAiService.isUseAdditionalInstruction || FirebaseService.getAdditionalPrompt() != GenAiService.additionalInstruction){
                    GenAiService.isUseAdditionalInstruction = FirebaseService.getUseAdditionalPrompt();
                    GenAiService.setAdditionalInstruction(FirebaseService.getAdditionalPrompt());
                }
                const res = await GenAiService.chat?.sendMessage(text);
                try{
                    if (res){
                        return res.response.text();
                    }
                }catch (err){
                    return "****"
                }
            }catch (e) {
                console.error(e);
            }
            return "";
        }
    }
}