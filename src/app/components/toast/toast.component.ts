import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="toast"
          [class]="'toast-' + toast.type"
          @toastAnimation>
          <div class="toast-content">
            <span class="toast-icon">{{ getIcon(toast.type) }}</span>
            <p>{{ toast.message }}</p>
          </div>
          <button class="toast-close" (click)="removeToast(toast.id)" aria-label="Fermer">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 0.95rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border-left: 4px solid;
      animation: slideIn 300ms ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: rgba(76, 175, 80, 0.1);
      border-left-color: #4CAF50;
      color: #81C784;
    }

    .toast-error {
      background: rgba(244, 67, 54, 0.1);
      border-left-color: #F44336;
      color: #EF5350;
    }

    .toast-info {
      background: rgba(33, 150, 243, 0.1);
      border-left-color: #2196F3;
      color: #64B5F6;
    }

    .toast-warning {
      background: rgba(255, 152, 0, 0.1);
      border-left-color: #FF9800;
      color: #FFB74D;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .toast-icon {
      font-size: 1.2rem;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px 8px;
      opacity: 0.7;
      transition: opacity 200ms ease;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 12px;
        right: 12px;
        max-width: none;
      }

      .toast {
        font-size: 0.9rem;
      }
    }
  `],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toasts = signal<Toast[]>([]);
  private toastId = 0;

  ngOnInit() {
    // Injection du service de toasts sera fait via injection
  }

  addToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) {
    const id = `toast-${++this.toastId}`;
    const toast: Toast = { id, message, type };

    this.toasts.update(t => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }

    return id;
  }

  removeToast(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };
    return icons[type] || '•';
  }
}
