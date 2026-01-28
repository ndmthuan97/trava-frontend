import { HttpContextToken } from '@angular/common/http';

export const SHOW_LOADING = new HttpContextToken<boolean>(() => true);
export const LOADING_KEY = new HttpContextToken<string>(() => 'default');
