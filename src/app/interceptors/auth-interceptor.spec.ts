import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';
import { ToastrService } from 'ngx-toastr';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let toastrServiceMock: jasmine.SpyObj<ToastrService>;

  const mockToken = 'mock-jwt-token';
  const testUrl = '/api/test';

  beforeEach(() => {
    // Mock AuthService and ToastrService
    authServiceMock = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    toastrServiceMock = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should not add Authorization header when token is null', () => {
    authServiceMock.getToken.and.returnValue(null);

    httpClient.get(testUrl).subscribe(response => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ success: true });
  });
});