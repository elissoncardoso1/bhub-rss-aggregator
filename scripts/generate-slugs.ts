import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script para gerar slugs para categorias que não possuem
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim()
}

async function main() {
  console.log('🔧 Gerando slugs para categorias...')

  // Busca todas as categorias
  const allCategories = await prisma.category.findMany()
  
  // Filtra as que não têm slug ou têm slug vazio
  const categories = allCategories.filter(cat => !cat.slug || cat.slug === '')

  if (categories.length === 0) {
    console.log('✅ Todas as categorias já possuem slugs')
    return
  }

  console.log(`📝 Encontradas ${categories.length} categorias sem slug`)

  for (const category of categories) {
    const slug = generateSlug(category.name)
    
    // Verifica se o slug já existe
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    let finalSlug = slug
    let counter = 1

    // Se já existe, adiciona um número
    while (existingCategory && existingCategory.id !== category.id) {
      finalSlug = `${slug}-${counter}`
      counter++
      
      const check = await prisma.category.findUnique({
        where: { slug: finalSlug }
      })
      
      if (!check) break
    }

    await prisma.category.update({
      where: { id: category.id },
      data: { slug: finalSlug }
    })

    console.log(`  ✅ ${category.name} -> ${finalSlug}`)
  }

  console.log('🎉 Slugs gerados com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao gerar slugs:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
