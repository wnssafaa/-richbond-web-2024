import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginHistoryPageComponent } from './login-history-page.component';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('LoginHistoryPageComponent', () => {
  let component: LoginHistoryPageComponent;
  let fixture: ComponentFixture<LoginHistoryPageComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserInfo', 'logout']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['setDefaultLang', 'use']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginHistoryPageComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginHistoryPageComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.menuOpen).toBeFalse();
    expect(component.currentLanguage).toBe('fr');
    expect(component.username).toBe('');
    expect(component.role).toBe('');
  });

  it('should load current user on init', () => {
    const mockUserData = {
      username: 'testuser',
      role: 'ADMIN',
      email: 'test@example.com',
      nom: 'Test',
      prenom: 'User',
      telephone: '123456789',
      status: 'ACTIVE',
      imagePath: 'test.jpg'
    };

    mockAuthService.getCurrentUserInfo.and.returnValue(of(mockUserData));

    component.ngOnInit();

    expect(mockAuthService.getCurrentUserInfo).toHaveBeenCalled();
    expect(component.username).toBe('testuser');
    expect(component.role).toBe('ADMIN');
    expect(component.email).toBe('test@example.com');
  });

  it('should toggle menu', () => {
    expect(component.menuOpen).toBeFalse();
    
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
    
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('should change language', () => {
    component.changeLanguage('en');
    
    expect(component.currentLanguage).toBe('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should open logout dialog', () => {
    const mockDialogRef = {
      afterClosed: () => of(true)
    };
    mockDialog.open.and.returnValue(mockDialogRef as any);
    spyOn(component, 'logout');

    component.openLogoutDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(component['ConfirmLogoutComponent'], {
      width: '700px'
    });
  });

  it('should logout user', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});

