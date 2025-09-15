import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        {allPostsData.map((post, index) => {
          const postContent = (
            <article key={post.id} className="py-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center mb-2">
                    <img 
                      src={post.author_image} 
                      alt={post.author} 
                      width="24" 
                      height="24" 
                      className="rounded-circle me-2"
                    />
                    <span className="fw-bold">{post.author}</span>
                  </div>
                  <Link href={`/posts/${post.id}`} className="text-decoration-none text-dark">
                    <h2 className="h3 fw-bold">{post.title}</h2>
                    <p className="text-muted d-none d-md-block">{post.snippet}</p>
                  </Link>
                  <div className="text-muted">
                    <small>
                      {new Date(post.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                    </small>
                    <span className="mx-1">·</span>
                    {post.tags?.map((tag) => (
                      <Link key={tag} href={`/tags/${tag}`} className="badge bg-light text-dark text-decoration-none me-1">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-md-4 mt-3 mt-md-0">
                  <Link href={`/posts/${post.id}`}>
                    <img src={post.post_image} className="img-fluid" alt={post.title} />
                  </Link>
                </div>
              </div>
            </article>
          );

          if (index === 0) {
            return (
              <div key={post.id} className="ultimo-post border-bottom">
                {postContent}
              </div>
            );
          } else {
            return (
              <div key={post.id} className="border-bottom">
                {postContent}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
