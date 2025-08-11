import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3L21 21M3 21L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">PyTrader</span>
        </div>
        <div class="user-menu">
          <div class="user-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
    }

    .header-content {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;
    }

    .logo svg {
      color: #3b82f6;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .user-avatar:hover {
      background: #e2e8f0;
    }

    .user-avatar svg {
      color: #64748b;
    }
  `]
})
export class HeaderComponent {}