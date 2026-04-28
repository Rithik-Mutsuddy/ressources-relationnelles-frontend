import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../../../core/services/resource.service';
import { CommentService } from '../../../../core/services/comment.service';
import { InteractionService } from '../../../../core/services/interaction.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Resource } from '../../../../core/models/resource.model';
import { Comment } from '../../../../core/models/comment.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './resource-detail.component.html',
  styleUrl: './resource-detail.component.scss'
})
export class ResourceDetailComponent implements OnInit {
  private resourceSvc    = inject(ResourceService);
  private commentSvc     = inject(CommentService);
  private interactionSvc = inject(InteractionService);
  auth                   = inject(AuthService);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);

  resource   = signal<Resource | null>(null);
  comments   = signal<Comment[]>([]);
  newComment = '';
  isFavorite = signal(false);

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.resourceSvc.getOne(id).subscribe(r => this.resource.set(r));
    this.commentSvc.getByResource(id).subscribe(c => this.comments.set(c));
  }

  submitComment() {
    if (!this.newComment.trim()) return;
    const id = this.resource()!.id;
    this.commentSvc.create(id, this.newComment).subscribe(c => {
      this.comments.update(list => [c, ...list]);
      this.newComment = '';
    });
  }

  toggleFavorite() {
    const id = this.resource()!.id;
    if (this.isFavorite()) {
      this.interactionSvc.remove(id, 'favorite').subscribe(() => this.isFavorite.set(false));
    } else {
      this.interactionSvc.interact(id, 'favorite').subscribe(() => this.isFavorite.set(true));
    }
  }

  isAuthor(): boolean {
    const user = this.auth.currentUser();
    const res  = this.resource();
    return !!(user && res && user.id === res.author.id);
  }

  getInitial(firstname: string): string {
    return firstname?.charAt(0).toUpperCase() ?? '?';
  }

  getTypeBadgeClass(type: string) {
    const map: Record<string, string> = {
      video: 'badge--purple', article: 'badge--blue',
      guide: 'badge--green',  activity: 'badge--orange'
    };
    return map[type] ?? 'badge--blue';
  }
}