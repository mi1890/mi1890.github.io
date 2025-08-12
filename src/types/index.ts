// 文章类型定义
export interface Article {
  id?: string;
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  readingTime?: number;
}

// 文章元数据
export interface ArticleMeta {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

// 分页信息
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  articlesPerPage: number;
}

// 搜索结果
export interface SearchResult {
  articles: Article[];
  query: string;
  total: number;
}

// 博客配置
export interface BlogConfig {
  title: string;
  description: string;
  author: string;
  url: string;
  articlesPerPage: number;
}

// 标签统计
export interface TagCount {
  tag: string;
  count: number;
}

// 博客上下文类型
export interface BlogContextType {
  articles: Article[];
  tags: string[];
  loading: boolean;
  error: string | null;
  searchArticles: (query: string) => Article[];
  getArticlesByTag: (tag: string) => Article[];
  getArticle: (slug: string) => Promise<Article | null>;
}

// 路由参数
export interface RouteParams {
  slug?: string;
  [key: string]: string | undefined;
}

// 组件 Props 类型
export interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface HeaderProps {
  title?: string;
}

export interface FooterProps {
  className?: string;
}

// React Router 扩展
export interface NavigateFunction {
  (to: string, options?: { replace?: boolean; state?: any }): void;
  (delta: number): void;
}

// Vite 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly BASE_URL: string
  readonly MODE: string
  readonly SSR: boolean
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
