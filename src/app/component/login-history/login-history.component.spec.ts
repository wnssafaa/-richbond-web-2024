import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginHistoryComponent } from './login-history.component';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('LoginHistoryComponent', () => {
  let component: LoginHistoryComponent;
  let fixture: ComponentFixture<LoginHistoryComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getLoginHistory']);

    await TestBed.configureTestingModule({
      imports: [LoginHistoryComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginHistoryComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load login history on init', () => {
    const mockHistory = [
      {
        id: 1,
        loginTime: '2024-01-01T10:00:00Z',
        logoutTime: '2024-01-01T18:00:00Z',
        ipAddress: '192.168.1.1',
        user: {
          id: 1,
          username: 'testuser',
          nom: 'Test',
          prenom: 'User',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      }
    ];

    mockAuthService.getLoginHistory.and.returnValue(of(mockHistory));

    component.ngOnInit();

    expect(mockAuthService.getLoginHistory).toHaveBeenCalled();
    expect(component.loginHistory).toEqual(mockHistory);
    expect(component.dataSource.data).toEqual(mockHistory);
  });

  it('should apply filters correctly', () => {
    component.loginHistory = [
      {
        id: 1,
        loginTime: '2024-01-01T10:00:00Z',
        logoutTime: '2024-01-01T18:00:00Z',
        ipAddress: '192.168.1.1',
        user: {
          id: 1,
          username: 'testuser',
          nom: 'Test',
          prenom: 'User',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      },
      {
        id: 2,
        loginTime: '2024-01-02T10:00:00Z',
        logoutTime: '2024-01-02T18:00:00Z',
        ipAddress: '192.168.1.2',
        user: {
          id: 2,
          username: 'testuser2',
          nom: 'Test2',
          prenom: 'User2',
          role: 'SUPERVISEUR',
          status: 'INACTIVE'
        }
      }
    ];

    component.dataSource.data = component.loginHistory;
    component.selectedRole = 'ADMIN';
    component.applyFilters();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].user.role).toBe('ADMIN');
  });

  it('should reset filters correctly', () => {
    component.searchText = 'test';
    component.selectedRole = 'ADMIN';
    component.selectedStatus = 'ACTIVE';
    component.loginHistory = [{ id: 1, user: { role: 'ADMIN' } }];
    component.dataSource.data = [];

    component.resetFilters();

    expect(component.searchText).toBe('');
    expect(component.selectedRole).toBe('');
    expect(component.selectedStatus).toBe('');
    expect(component.dataSource.data).toEqual(component.loginHistory);
  });

  it('should format login date correctly', () => {
    const dateString = '2024-01-01T10:00:00Z';
    const formattedDate = component.formatLoginDate(dateString);
    
    expect(formattedDate).toContain('01/01/2024');
  });

  it('should calculate session duration correctly', () => {
    const loginTime = '2024-01-01T10:00:00Z';
    const logoutTime = '2024-01-01T18:30:00Z';
    
    const duration = component.calculateSessionDuration(loginTime, logoutTime);
    
    expect(duration).toBe('8h 30m');
  });

  it('should handle active session correctly', () => {
    const loginTime = '2024-01-01T10:00:00Z';
    const duration = component.calculateSessionDuration(loginTime, null);
    
    expect(duration).toBe('En cours');
  });
});

