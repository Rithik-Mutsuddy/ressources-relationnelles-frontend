import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../../core/services/comment.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-reported-comments',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './reported-comments.component.html',
  styleUrl: './reported-comments.component.scss'
})
export class ReportedCommentsComponent implements OnInit {

  private commentSvc = inject(CommentService);

  comments = signal<any[]>([]);
  loading = signal(true);

  toast = signal<{ msg: string; type: 'validate' | 'reject' } | null>(null);

  ngOnInit() {
    this.commentSvc.getReported().subscribe({
      next: (data) => {
        this.comments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  validate(comment: any, event: Event) {
    event.stopPropagation();

    this.commentSvc.validateComment(comment.id).subscribe(() => {
      this.comments.update(list => list.filter(c => c.id !== comment.id));
      this.showToast('Commentaire validé', 'validate');
    });
  }

  reject(comment: any, event: Event) {
    event.stopPropagation();

    this.commentSvc.rejectComment(comment.id).subscribe(() => {
      this.comments.update(list => list.filter(c => c.id !== comment.id));
      this.showToast('Commentaire supprimé', 'reject');
    });
  }

  private showToast(msg: string, type: 'validate' | 'reject') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}