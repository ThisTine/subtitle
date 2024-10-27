import { initializeApp } from "firebase-admin/app";
import {getRemoteConfig, ServerConfig, ServerTemplate} from "firebase-admin/remote-config";
import {App as FirebaseApp} from "firebase-admin/app";
import {RemoteConfig} from "firebase-admin/remote-config";
import {credential} from "firebase-admin";

export class FirebaseService {
    private static instance: FirebaseApp;
    private static remoteConfig: RemoteConfig;
    private static template: ServerTemplate;
    private static cfg: ServerConfig;
    private firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    public static async initFeatureFlag(){
        FirebaseService.remoteConfig = getRemoteConfig(FirebaseService.instance);
        FirebaseService.template = FirebaseService.remoteConfig.initServerTemplate({
            defaultConfig:{
                language: 'th-TH',
                "disable_subtitle": false,
                "disable_translate": false,
                "additional_prompt": '',
                "use_additional_prompt": false
            }
        })
        await FirebaseService.template.load()
        FirebaseService.cfg = FirebaseService.template.evaluate()
        setInterval(async ()=>{
            await FirebaseService.template.load()
            FirebaseService.cfg = FirebaseService.template.evaluate()
        }, 3000)
    }

    constructor() {
        FirebaseService.instance =  initializeApp({
        credential: credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: atob(process.env.FIREBASE_PRIVATE_KEY ?? ''),
        })
        });
    }

    public static getValue = (key: string) => {
        return FirebaseService.cfg.getValue(key);
    }

    public static getLanguageCode = () => {
        return this.getValue('language').asString() ?? 'th-TH';
    }
    public static getDisableSubtitle = () => {
        return this.getValue('disable_subtitle').asBoolean() ?? false;
    }
    public static getDisableTranslate = () => {
        return this.getValue('disable_translate').asBoolean() ?? false;
    }
    public static getAdditionalPrompt = () => {
        return this.getValue('additional_prompt').asString() ?? '';
    }
    public static getUseAdditionalPrompt = () => {
        return this.getValue('use_additional_prompt').asBoolean() ?? false;
    }
}