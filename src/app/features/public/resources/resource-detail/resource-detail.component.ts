import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ResourceService } from '../../../../core/services/resource.service';
import { CommentService } from '../../../../core/services/comment.service';
import { InteractionService } from '../../../../core/services/interaction.service';
import { AuthService } from '../../../../core/auth/auth.service';

import { Resource } from '../../../../core/models/resource.model';
import { Comment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './resource-detail.component.html',
  styleUrl: './resource-detail.component.scss'
})
export class ResourceDetailComponent implements OnInit {

  private resourceSvc = inject(ResourceService);
  private commentSvc = inject(CommentService);
  private interactionSvc = inject(InteractionService);
  auth = inject(AuthService);

  private route = inject(ActivatedRoute);

  resource = signal<Resource | null>(null);
  comments = signal<Comment[]>([]);

  newComment = '';
  isFavorite = signal(false);

  replyingTo = signal<Comment | null>(null);
  replyContent = signal('');

  isAside = signal(false);
  openMenuId: number | null = null;

  expandedReplies = signal<Record<number, boolean>>({});

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.resourceSvc.getOne(id).subscribe(res => {
      this.resource.set(res);
    });

    this.commentSvc.getByResource(id).subscribe(comments => {
      this.comments.set(comments);
    });

    if (this.auth.isAuthenticated()) {
      this.interactionSvc.getByResource(id).subscribe(interactions => {
        this.isFavorite.set(interactions.some(i => i.type === 'favorite'));
        this.isAside.set(interactions.some(i => i.type === 'aside'));
      });
    }
  }

  submitComment() {
    const content = this.newComment.trim();
    if (!content) return;

    const res = this.resource();
    if (!res) return;

    this.commentSvc.create(res.id, content).subscribe(c => {
      this.comments.update(list => [c, ...list]);
      this.newComment = '';
    });
  }

  startReply(comment: Comment) {
    this.replyingTo.set(comment);
    this.replyContent.set('');
  }

  cancelReply() {
    this.replyingTo.set(null);
    this.replyContent.set('');
  }

  submitReply(parent: Comment) {
    const content = this.replyContent().trim();
    if (!content) return;

    const res = this.resource();
    if (!res) return;

    this.commentSvc.reply(res.id, parent.id, content)
      .subscribe(reply => {
        this.comments.update(list => [reply, ...list]);
        this.cancelReply();
      });
  }

  toggleReplies(commentId: number) {
    this.expandedReplies.update(state => ({
      ...state,
      [commentId]: !state[commentId]
    }));
  }

  toggleMenu(id: number) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  getReplies(parentId: number): Comment[] {
    return this.comments().filter(c => c.parentId === parentId);
  }

  toggleFavorite() {
    const res = this.resource();
    if (!res) return;

    if (this.isFavorite()) {
      this.interactionSvc.remove(res.id, 'favorite')
        .subscribe(() => {
          this.isFavorite.set(false);
        });
    } else {
      this.interactionSvc.interact(res.id, 'favorite')
        .subscribe(() => {
          this.isFavorite.set(true);
        });
    }
  }

  toggleAside() {
    const res = this.resource();
    if (!res) return;

    if (this.isAside()) {
      this.interactionSvc.remove(res.id, 'aside')
        .subscribe(() => this.isAside.set(false));
    } else {
      this.interactionSvc.interact(res.id, 'aside')
        .subscribe(() => this.isAside.set(true));
    }
  }

  isAuthor(): boolean {
    const user = this.auth.currentUser();
    const res = this.resource();
    return !!(user && res && user.id === res.author.id);
  }

  getInitial(name: string): string {
    return name?.charAt(0).toUpperCase() ?? '?';
  }

  getTypeBadgeClass(type: string): string {
    return {
      video: 'badge--purple',
      article: 'badge--blue',
      guide: 'badge--green',
      activity: 'badge--orange'
    }[type] ?? 'badge--blue';
  }

  reportComment(comment: any) {
    this.commentSvc.report(comment.id,this.resource()!.id).subscribe(() => {
      this.openMenuId = null;
      this.showToast('Commentaire signalé', 'reject');
    });
  }

  toast = signal<{ msg: string; type: 'signalé' | 'reject' } | null>(null);

  private showToast(msg: string, type: 'signalé' | 'reject') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}