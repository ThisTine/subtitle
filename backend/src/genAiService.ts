import {ChatSession, FunctionDeclaration, GenerativeModel, GoogleGenerativeAI, SchemaType} from "@google/generative-ai";
import {FirebaseService} from "./firebaseService";


export class GenAiService{
    private static genAi: GoogleGenerativeAI | null = null;
    private static model: GenerativeModel | null = null;
    private static chat: ChatSession | null = null;
    private static additionalInstruction: string = "";
    private static isUseAdditionalInstruction: boolean = false;
    private static modelCfg = "gemini-1.5-flash";
    private static _systemInstruction: string = `
    You are an English translator at Google's DevFest Cloud Bangkok event. This event is a technology conference that focuses on Google Cloud technologies.
    
    # STEPS
    1. If there is an input proceed to step 2, otherwise return the input.
    2. Translate the speakers' text to English.
    3. Step back and correct the translation if it's wrong.
    4. If you see text similar to DevFest Cloud Bangkok, translate it to DevFest Cloud Bangkok.
    5. If you're unable to translate the text, return the input.
    
    # OUTPUT
    - The translated text.
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
        // GenAiService.chat = GenAiService.model.startChat({
        //     safetySettings:[
        //         {
        //             category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        //             threshold: HarmBlockThreshold.BLOCK_NONE,
        //         },
        //         {
        //             category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        //             threshold: HarmBlockThreshold.BLOCK_NONE
        //         },
        //         {
        //             category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        //             threshold: HarmBlockThreshold.BLOCK_NONE
        //         },
        //         {
        //             category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        //             threshold: HarmBlockThreshold.BLOCK_NONE
        //         },
        //     ]
        // });
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
                const res = await GenAiService.model?.generateContent(text);
                try{
                    if (res){
                        return res.response.text();
                    }
                }catch (err){
                    console.error(err);
                    return "****"
                }
            }catch (e) {
                console.error(e);
            }
            return "";
        }
    }
}