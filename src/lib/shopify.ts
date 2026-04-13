const SHOPIFY_STORE_URL = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL!
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!

const STOREFRONT_API_URL = `${SHOPIFY_STORE_URL}/api/2026-01/graphql.json`

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '))
  }

  return json.data
}

// 장바구니 생성
export async function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null
      userErrors: { field: string[]; message: string }[]
    }
  }>(query, {
    input: {
      lines: lines.map(line => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      })),
    },
  })

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map(e => e.message).join(', '))
  }

  return data.cartCreate.cart!
}

// Shopify 상품의 variant ID 조회 (handle로)
export async function getProductVariantId(handle: string): Promise<string | null> {
  const query = `
    query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
        variants(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    productByHandle: {
      variants: { edges: { node: { id: string } }[] }
    } | null
  }>(query, { handle })

  if (!data.productByHandle) return null
  return data.productByHandle.variants.edges[0]?.node.id ?? null
}
