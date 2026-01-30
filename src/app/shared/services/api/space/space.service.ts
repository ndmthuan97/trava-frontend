import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService } from './../../core/request/request.service';
import { inject, Injectable } from '@angular/core';
import { Space } from '../../../models/entities/space.model';
import { CreateSpaceRequest } from '../../../models/request/space-request.model';

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  private readonly requestService = inject(RequestService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly SPACE_API_URL = `${this.BASE_API_URL}/spaces`;

  getSpacesByUserId(): Observable<Space[]> {
    return this.requestService
      .get<Space[] | null>(`${this.SPACE_API_URL}/my-spaces`)
      .pipe(map(res => res.data || []));
  }

  createSpace(space: CreateSpaceRequest): Observable<Space | null> {
    return this.requestService
      .post<Space | null>(this.SPACE_API_URL, space)
      .pipe(map(res => res.data ?? null));
  }
}
