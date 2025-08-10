import { Pool, PoolConfig } from "pg";
import { User, Client, Invoice } from "../types";

export class DatabaseService {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async getUserByPlatformId(
    platformId: string,
    platformType: string
  ): Promise<User | null> {
    const result = await this.pool.query(
      "SELECT * FROM users WHERE platform_id = $1 AND platform_type = $2",
      [platformId, platformType]
    );
    return result.rows[0] || null;
  }

  // Add other database methods here...
}
