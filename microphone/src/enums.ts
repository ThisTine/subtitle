export enum socketEvents {
    MICACTION = 'micAction',
    MICNOTIFICATION = 'micNotification',
    MICSENDAUDIO = 'micSendAudio',
}

export enum micActions {
    SETMIC = 'setMic',
    REPLACEMIC = 'replaceMic',
}

export type TMicAction = IMicAction<micActions.REPLACEMIC, null> | IMicAction<micActions.SETMIC, null>;

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