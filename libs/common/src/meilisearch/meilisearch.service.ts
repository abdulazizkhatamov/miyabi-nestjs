import { Injectable, Logger } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class MeilisearchService {
  private client: MeiliSearch;
  private logger = new Logger(MeilisearchService.name);

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_URL || 'http://127.0.0.1:7700',
      apiKey: process.env.MEILI_MASTER_KEY || '',
    });
  }

  async indexProducts(products: any[]) {
    const index = this.client.index('products');
    await index.addDocuments(products);
    this.logger.log(`Indexed ${products.length} products`);
  }

  async searchProducts(
    term: string,
    filters: Record<string, any> = {},
    page = 1,
    limit = 20,
  ) {
    const index = this.client.index('products');
    const filterArray = Object.keys(filters).map(
      (key) => `${key} = "${filters[key]}"`,
    );
    const res = await index.search(term, {
      filter: filterArray.length ? filterArray : undefined,
      limit,
      offset: (page - 1) * limit,
    });
    return res.hits;
  }

  async deleteProduct(productId: string) {
    const index = this.client.index('products');
    await index.deleteDocument(productId);
    this.logger.log(`Deleted product ${productId} from index`);
  }
}
