import { LOGIN_PROVIDER_TYPE, NetworkInterface, PAYMENT_PROVIDER_TYPE, PaymentParams, SignMessageParams, TorusCtorArgs, TorusParams, UserInfo, WALLET_PATH } from ".//interfaces";
import TorusCommunicationProvider from "./communicationProvider";
import TorusInPageProvider from "./inPageProvider";
declare class Torus {
    isInitialized: boolean;
    torusAlert: HTMLDivElement;
    modalZIndex: number;
    alertZIndex: number;
    requestedLoginProvider?: LOGIN_PROVIDER_TYPE;
    provider: TorusInPageProvider;
    communicationProvider: TorusCommunicationProvider;
    dappStorageKey: string;
    private torusAlertContainer;
    private torusUrl;
    private torusIframe;
    private styleLink;
    constructor({ modalZIndex }?: TorusCtorArgs);
    init({ buildEnv, enableLogging, network, showTorusButton, useLocalStorage, buttonPosition, apiKey, }?: TorusParams): Promise<void>;
    login(params?: {
        loginProvider?: LOGIN_PROVIDER_TYPE;
        login_hint?: string;
    }): Promise<string[]>;
    logout(): Promise<void>;
    cleanUp(): Promise<void>;
    clearInit(): void;
    hideTorusButton(): void;
    showTorusButton(): void;
    setProvider(params: NetworkInterface): Promise<void>;
    showWallet(path: WALLET_PATH, params?: Record<string, string>): Promise<void>;
    getUserInfo(): Promise<UserInfo>;
    initiateTopup(provider: PAYMENT_PROVIDER_TYPE, params: PaymentParams): Promise<boolean>;
    signMessage(params: SignMessageParams): Promise<{
        signature: Uint8Array;
    }>;
    private _setupWeb3;
    private handleDappStorageKey;
}
export default Torus;
