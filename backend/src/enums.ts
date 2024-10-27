export enum socketEvents {
    MICACTION = 'micAction',
    MICNOTIFICATION = 'micNotification',
    MICSENDAUDIO = 'micSendAudio',
    DISPLAYRESULT = 'displayResult',
}

export enum micActions {
    SETMIC = 'setMic',
    REPLACEMIC = 'replaceMic',
}

export type TMicAction = IMicAction<micActions.REPLACEMIC, null> | IMicAction<micActions.SETMIC, null>;

export type TDisplayResult = IDisplayResult<displayResults.LIVETEXT, string> | IDisplayResult<displayResults.TRANSLATEDTEXT, string>;

export interface IMicAction<T extends micActions,D> {
    action: T;
    payload: D;
}

export enum micNotifications {
    INFO = 'info',
    ERROR = 'error',
    SETMICSUCCESS = 'setMicSuccess',
    MICALREADYINUSE = 'micAlreadyInUse',
    MICREPLACED = 'micReplaced',
}

export interface IMicNotification<T extends micNotifications,D> {
    action: T;
    payload: D;
}

export const buildMicNotification = <T extends micNotifications,D>(action: T, payload: D): IMicNotification<T,D> => {
    return {
        action,
        payload,
    }
}

export const buildDisplayResult = <T extends displayResults,D>(action: T, payload: D): IDisplayResult<any, any> => {
    return {
        action,
        payload,
    }
}

export enum displayResults {
    LIVETEXT = 'liveText',
    TRANSLATEDTEXT = 'translatedText',
}

export interface IDisplayResult<T extends  displayResults, D> {
    action: T;
    payload: D;
}