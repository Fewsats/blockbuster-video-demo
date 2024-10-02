export class L402CredentialManager {
  private static getStorageKey(endpoint: string): string {
    return `l402_credentials_${endpoint}`;
  }

  static saveCredentials(endpoint: string, authHeader: string): void {
    localStorage.setItem(this.getStorageKey(endpoint), authHeader);
  }

  static getCredentials(endpoint: string): string | null {
    const storedCredentials = localStorage.getItem(this.getStorageKey(endpoint));
    return storedCredentials;
  }

  static clearCredentials(endpoint: string): void {
    localStorage.removeItem(this.getStorageKey(endpoint));
  }
}