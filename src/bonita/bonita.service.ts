import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface BonitaSession {
  jsessionid: string;
  'X-Bonita-API-Token': string;
}

@Injectable()
export class BonitaService {
  private readonly logger = new Logger(BonitaService.name);
  private axiosInstance: AxiosInstance;
  private session: BonitaSession | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.BONITA_URL || 'http://localhost:8080/bonita',
      timeout: 10000,
    });
  }

  async login(): Promise<void> {
    try {
      const loginResponse = await this.axiosInstance.post(
        '/loginservice',
        null,
        {
          params: {
            username: process.env.BONITA_USERNAME || 'admin',
            password: process.env.BONITA_PASSWORD || 'bpm',
            redirect: 'false',
          },
        },
      );

      const cookies = loginResponse.headers['set-cookie'];
      if (!cookies) {
        throw new Error('No se recibieron cookies de autenticación');
      }

      const jsessionid = this.extractCookie(cookies, 'JSESSIONID');
      const apiToken = this.extractCookie(cookies, 'X-Bonita-API-Token');

      if (!jsessionid || !apiToken) {
        throw new Error('No se pudieron extraer las cookies necesarias');
      }

      this.session = {
        jsessionid,
        'X-Bonita-API-Token': apiToken,
      };

      this.axiosInstance.defaults.headers.common['Cookie'] =
        `JSESSIONID=${jsessionid}`;
      this.axiosInstance.defaults.headers.common['X-Bonita-API-Token'] =
        apiToken;

      this.logger.log('Sesión iniciada correctamente en Bonita BPM');
    } catch (error) {
      this.logger.error('Error al iniciar sesión en Bonita BPM:', error);
      throw error;
    }
  }

  private extractCookie(cookies: string[], cookieName: string): string | null {
    for (const cookie of cookies) {
      const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  async sendMessage(
    processInstanceId: string,
    messageName: string,
    data: any = {},
  ): Promise<void> {
    try {
      if (!this.session) {
        await this.login();
      }

      const messageData = {
        messageName,
        targetProcess: processInstanceId,
        messageContent: data,
      };

      const response = await this.axiosInstance.post(
        '/API/bpm/message',
        messageData,
      );

      this.logger.log(
        `Mensaje '${messageName}' enviado correctamente al proceso ${processInstanceId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error al enviar mensaje a Bonita BPM:`, error);

      // Si el error es de autenticación, intentamos relogin
      if (error.response?.status === 401) {
        this.session = null;
        await this.login();
        return this.sendMessage(processInstanceId, messageName, data);
      }

      throw error;
    }
  }

  async confirmEntrega(
    processInstanceId: string,
    entregaData: any,
  ): Promise<void> {
    return this.sendMessage(
      processInstanceId,
      'entregaConfirmada',
      entregaData,
    );
  }
}
