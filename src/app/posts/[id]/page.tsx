import { getPostData, getAllPostIds } from '@/lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// This function tells Next.js which pages to build at build time
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(path => ({ id: path.params.id }));
}

// This function generates the metadata for the page (e.g., the title)
export async function generateMetadata({ params }: { params: { id: string } }) {
  const postData = await getPostData(params.id);
  return {
    title: postData.title,
  };
}

export default async function Post({ params }: { params: { id: string } }) {
  const postData = await getPostData(params.id);

  if (!postData) {
    notFound();
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <article>
          <header className="mb-4 border-bottom pb-4">
             <h1 className="fw-bolder mb-3">{postData.title}</h1>
            <div className="d-flex align-items-center mb-3">
              <img 
                src={postData.author_image} 
                alt={postData.author} 
                width="48" 
                height="48" 
                className="rounded-circle me-3"
              />
              <div>
                <div className="fw-bold">{postData.author}</div>
                <div className="text-muted">
                  <span>{new Date(postData.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div>
            <span className="text-muted fst-italic d-block mb-2">
              Cloud Engineer · DevOps · Site Reliability Engineer · Cloud & Containers · Guitar Player · Coffee Lover
            </span>
            </div>
            <div></div>
            <div className="mb-3">
              {postData.tags?.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`} className="badge bg-light text-dark text-decoration-none me-1">
                  {tag}
                </Link>
              ))}
            </div>
          </header>
          <section className="mb-5 fs-5 lh-lg" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
          <Link href="/" className="btn btn-outline-secondary">← Voltar para a Home</Link>
        </article>
      </div>
    </div>
  );
}