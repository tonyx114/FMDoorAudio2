export {};

declare global {
    interface Window {
        electron: {

            exit: () => void;

            toggleFullscreen: (value: boolean) => void;

            loadDoorConfig: () => Promise<any>;

            saveProject: (doors: any[]) => Promise<boolean>;

            openProject: () => Promise<any[] | null>;

            exportXml: (doors: any[]) => Promise<boolean>;

            opencofe: () => Promise<void>;
        };
    }
}