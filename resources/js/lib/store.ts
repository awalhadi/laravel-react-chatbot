class Store {
    setApiToken(token: string) {
        localStorage.setItem('api_token', token);
    }

    getApiToken() {
        return localStorage.getItem('api_token');
    }

    clearApiToken() {
        localStorage.removeItem('api_token');
    }
}

export const store = new Store();
