import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<any> {
    return this.api.get('users/profile');
  }

  updateProfile(payload: UpdateProfilePayload): Observable<any> {
    return this.api.put('users/profile', payload);
  }
}
