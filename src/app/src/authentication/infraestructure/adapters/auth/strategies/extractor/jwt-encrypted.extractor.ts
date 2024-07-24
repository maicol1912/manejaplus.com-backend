import { CryptoLibrary } from '@app/shared/encoders/crypto.encoder';

const AUTH_HEADER = 'authorization';
const BEARER_AUTH_SCHEME = 'bearer';

const EXTRACTOR_JWT = {
  fromAuthHeaderWithScheme: function (auth_scheme: string) {
    const auth_scheme_lower = auth_scheme.toLowerCase();
    return function (request: any) {
      let token = null;
      if (request.headers[AUTH_HEADER]) {
        const authHeader = request.headers[AUTH_HEADER];
        const parts = authHeader.split(' ');
        if (parts.length === 2 && auth_scheme_lower === parts[0].toLowerCase()) {
          const encryptedToken = parts[1];
          try {
            token = CryptoLibrary.decryptString(encryptedToken);
          } catch (error) {}
        }
      }
      return token;
    };
  },

  fromAuthHeaderAsBearerToken: function () {
    return this.fromAuthHeaderWithScheme(BEARER_AUTH_SCHEME);
  }
};

export { EXTRACTOR_JWT };
