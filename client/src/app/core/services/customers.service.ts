import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/utils.model';
import { CustomerDropdownDto } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'http://localhost:3000/api/customers';

  constructor(private http: HttpClient) {}

  getCustomers(
    search?: string,
    page = 1,
    limit = 5,
  ): Observable<PaginatedResponse<CustomerDropdownDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<CustomerDropdownDto>>(this.apiUrl, {
      params,
    });
  }
}
