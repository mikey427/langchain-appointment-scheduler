interface Session {
    id: string;
    instructions: string;
    tools: any;
    schema: any;
    conversation: any;
}
declare function initializeCall(): Promise<{
    id: any;
}>;
declare let session: Session;
declare function refreshChatWindow(): void;
//# sourceMappingURL=app.d.ts.map