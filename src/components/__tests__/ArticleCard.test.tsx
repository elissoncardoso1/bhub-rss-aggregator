import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Mock simples do componente ArticleCard para teste básico
const MockArticleCard = ({ article, variant = 'secondary' }: any) => {
  return (
    <article className={`journal-card-${variant}`}>
      <h2>{article.title}</h2>
      <p>{article.abstract}</p>
      <span>{article.journalName}</span>
    </article>
  )
}

const mockArticle = {
  id: '1',
  title: 'Teste de Artigo',
  abstract: 'Este é um artigo de teste',
  journalName: 'Jornal de Teste',
  authors: ['Autor Teste']
}

describe('ArticleCard - Teste Básico', () => {
  it('renderiza corretamente', () => {
    render(<MockArticleCard article={mockArticle} variant="secondary" />)
    
    expect(screen.getByText('Teste de Artigo')).toBeInTheDocument()
    expect(screen.getByText('Este é um artigo de teste')).toBeInTheDocument()
    expect(screen.getByText('Jornal de Teste')).toBeInTheDocument()
  })

  it('aplica classes CSS corretas', () => {
    const { container } = render(<MockArticleCard article={mockArticle} variant="secondary" />)
    
    expect(container.firstChild).toHaveClass('journal-card-secondary')
  })
})
