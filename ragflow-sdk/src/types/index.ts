// 客户端配置
export interface RagFlowClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

// 通用响应
export interface RagFlowResponse<T> {
  code: number;
  message?: string;
  data?: T;
}

// 数据集相关类型
export interface Dataset {
  id: string;
  name: string;
  avatar?: string | null;
  chunk_count: number;
  chunk_method: string;
  create_date: string;
  create_time: number;
  created_by: string;
  description?: string | null;
  document_count: number;
  embedding_model: string;
  language: string;
  parser_config: {
    chunk_token_num?: number;
    delimiter?: string;
    html4excel?: boolean;
    layout_recognize?: boolean;
    raptor?: {
      user_raptor: boolean;
    };
    entity_types?: string[];
  };
  permission: string;
  similarity_threshold: number;
  status: string;
  tenant_id: string;
  token_num: number;
  update_date: string;
  update_time: number;
  vector_similarity_weight: number;
}

export interface CreateDatasetParams {
  name: string;
  avatar?: string;
  description?: string;
  embedding_model?: string;
  permission?: 'me' | 'team';
  chunk_method?: 'naive' | 'manual' | 'qa' | 'table' | 'paper' | 'book' | 'laws' | 'presentation' | 'picture' | 'one' | 'knowledge_graph' | 'email';
  parser_config?: {
    chunk_token_count?: number;
    layout_recognize?: boolean;
    html4excel?: boolean;
    delimiter?: string;
    task_page_size?: number;
    raptor?: { use_raptor: boolean };
    entity_types?: string[];
  };
}

export interface UpdateDatasetParams {
  name?: string;
  embedding_model?: string;
  chunk_method?: 'naive' | 'manual' | 'qa' | 'table' | 'paper' | 'book' | 'laws' | 'presentation' | 'picture' | 'one' | 'knowledge_graph' | 'email';
}

export interface ListDatasetsParams {
  page?: number;
  page_size?: number;
  orderby?: 'create_time' | 'update_time';
  desc?: boolean;
  name?: string;
  id?: string;
}

// 文档相关类型
export interface Document {
  id: string;
  name: string;
  dataset_id: string;
  location: string;
  chunk_count: number;
  chunk_method: string;
  create_date: string;
  create_time: number;
  created_by: string;
  process_begin_at: string | null;
  process_duation: number;
  progress: number;
  progress_msg: string;
  run: string;
  size: number;
  source_type: string;
  status: string;
  thumbnail: string | null;
  token_count: number;
  type: string;
  update_date: string;
  update_time: number;
  parser_config: {
    chunk_token_count?: number;
    delimiter?: string;
    layout_recognize?: boolean;
    task_page_size?: number;
    raptor?: { user_raptor: boolean };
    entity_types?: string[];
  };
}

export interface DocumentListResponse {
  docs: Document[];
  total: number;
}

export interface UpdateDocumentParams {
  name?: string;
  meta_fields?: Record<string, any>;
  chunk_method?: string;
  parser_config?: {
    chunk_token_count?: number;
    layout_recognize?: boolean;
    html4excel?: boolean;
    delimiter?: string;
    task_page_size?: number;
    raptor?: { use_raptor: boolean };
    entity_types?: string[];
  };
}

export interface ListDocumentsParams {
  page?: number;
  page_size?: number;
  orderby?: 'create_time' | 'update_time';
  desc?: boolean;
  keywords?: string;
  id?: string;
  name?: string;
}

// 块管理相关类型
export interface Chunk {
  id: string;
  content: string;
  document_id: string;
  document_keyword?: string;
  image_id?: string;
  important_keywords?: string[];
  positions?: string[];
  available_int?: number;
  docnm_kwd?: string;
}

export interface ChunkListResponse {
  chunks: Chunk[];
  doc: Document;
  total: number;
}

export interface AddChunkParams {
  content: string;
  important_keywords?: string[];
  questions?: string[];
}

export interface UpdateChunkParams {
  content?: string;
  important_keywords?: string[];
  available?: boolean;
}

export interface ListChunksParams {
  keywords?: string;
  page?: number;
  page_size?: number;
  id?: string;
}

// 检索相关类型
export interface RetrievalParams {
  question: string;
  dataset_ids?: string[];
  document_ids?: string[];
  page?: number;
  page_size?: number;
  similarity_threshold?: number;
  vector_similarity_weight?: number;
  top_k?: number;
  rerank_id?: string;
  keyword?: boolean;
  highlight?: boolean;
}

export interface RetrievalResult {
  chunks: {
    content: string;
    content_ltks?: string;
    document_id: string;
    document_keyword?: string;
    highlight?: string;
    id: string;
    image_id?: string;
    important_keywords?: string[];
    kb_id?: string;
    positions?: string[];
    similarity: number;
    term_similarity?: number;
    vector_similarity?: number;
  }[];
  doc_aggs?: {
    count: number;
    doc_id: string;
    doc_name: string;
  }[];
  total: number;
}

// 聊天完成相关类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  function_call?: any;
  tool_calls?: any;
}

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    finish_reason: string | null;
    index: number;
    logprobs: any;
    message?: {
      content: string;
      role: string;
    };
    delta?: {
      content: string | null;
      role: string;
      function_call: any;
      tool_calls: any;
    };
  }[];
  created: number;
  model: string;
  object: string;
  system_fingerprint: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_tokens_details?: {
      accepted_prediction_tokens: number;
      reasoning_tokens: number;
      rejected_prediction_tokens: number;
    };
  };
}

// 聊天助手相关类型
export interface ChatAssistant {
  id: string;
  name: string;
  avatar?: string;
  create_date: string;
  create_time: number;
  dataset_ids: string[];
  description?: string;
  do_refer: string;
  language: string;
  llm: {
    frequency_penalty: number;
    max_tokens: number;
    model_name: string;
    presence_penalty: number;
    temperature: number;
    top_p: number;
  };
  prompt: {
    empty_response: string;
    keywords_similarity_weight: number;
    opener: string;
    prompt: string;
    rerank_model: string;
    similarity_threshold: number;
    top_n: number;
    variables: {
      key: string;
      optional: boolean;
    }[];
  };
  prompt_type: string;
  status: string;
  tenant_id: string;
  top_k: number;
  update_date: string;
  update_time: number;
}

export interface CreateChatAssistantParams {
  name: string;
  avatar?: string;
  dataset_ids?: string[];
  llm?: {
    model_name?: string;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    max_tokens?: number;
  };
  prompt?: {
    similarity_threshold?: number;
    keywords_similarity_weight?: number;
    top_n?: number;
    variables?: {
      key: string;
      optional: boolean;
    }[];
    rerank_model?: string;
    top_k?: number;
    empty_response?: string;
    opener?: string;
    show_quote?: boolean;
    prompt?: string;
  };
}

export interface UpdateChatAssistantParams {
  name?: string;
  avatar?: string;
  dataset_ids?: string[];
  llm?: {
    model_name?: string;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    max_tokens?: number;
  };
  prompt?: {
    similarity_threshold?: number;
    keywords_similarity_weight?: number;
    top_n?: number;
    variables?: {
      key: string;
      optional: boolean;
    }[];
    rerank_model?: string;
    top_k?: number;
    empty_response?: string;
    opener?: string;
    show_quote?: boolean;
    prompt?: string;
  };
}

export interface ListChatAssistantsParams {
  page?: number;
  page_size?: number;
  orderby?: 'create_time' | 'update_time';
  desc?: boolean;
  name?: string;
  id?: string;
}

// 聊天会话相关类型
export interface ChatSession {
  id: string;
  chat_id: string;
  name: string;
  create_date: string;
  create_time: number;
  update_date: string;
  update_time: number;
  messages: ChatMessage[];
}

export interface CreateChatSessionParams {
  name: string;
  user_id?: string;
}

export interface UpdateChatSessionParams {
  name: string;
  user_id?: string;
}

export interface ListChatSessionsParams {
  page?: number;
  page_size?: number;
  orderby?: 'create_time' | 'update_time';
  desc?: boolean;
  name?: string;
  id?: string;
  user_id?: string;
}

// 聊天会话完成相关类型
export interface ChatConverseParams {
  question: string;
  stream?: boolean;
  session_id?: string;
  user_id?: string;
}

export interface ChatConverseResponse {
  answer: string;
  reference?: {
    total: number;
    chunks?: {
      id: string;
      content: string;
      document_id: string;
      document_name: string;
      dataset_id: string;
      image_id: string;
      similarity: number;
      vector_similarity: number;
      term_similarity: number;
      positions: string[];
    }[];
    doc_aggs?: {
      doc_name: string;
      doc_id: string;
      count: number;
    }[];
  };
  prompt?: string;
  audio_binary?: any;
  id?: string;
  session_id: string;
}

// 代理相关类型
export interface Agent {
  id: string;
  title: string;
  avatar?: string;
  description?: string;
  create_date: string;
  create_time: number;
  update_date: string;
  update_time: number;
  user_id: string;
  canvas_type?: string;
  dsl: {
    answer: any[];
    components: Record<string, {
      downstream: any[];
      obj: {
        component_name: string;
        params: Record<string, any>;
      };
      upstream: any[];
    }>;
    graph: {
      edges: any[];
      nodes: {
        data: {
          label: string;
          name: string;
          form?: Record<string, any>;
        };
        height: number;
        id: string;
        position: {
          x: number;
          y: number;
        };
        sourcePosition: string;
        targetPosition: string;
        type: string;
        width: number;
        positionAbsolute?: {
          x: number;
          y: number;
        };
        dragging?: boolean;
        selected?: boolean;
      }[];
    };
    history: any[];
    messages: any[];
    path: any[];
    reference: any[];
  };
}

export interface ListAgentsParams {
  page?: number;
  page_size?: number;
  orderby?: 'create_time' | 'update_time';
  desc?: boolean;
  name?: string;
  id?: string;
}

// 代理会话相关类型
export interface AgentSession {
  id: string;
  agent_id: string;
  message: {
    content: string;
    role: string;
  }[];
  source: string;
  user_id: string;
  dsl: any;
}

export interface CreateAgentSessionParams {
  user_id?: string;
  [key: string]: any; // 其他Begin组件指定的参数
}

export interface ListAgentSessionsParams {
  page?: number;
  page_size?: number;
  orderby?: 'create_time' | 'update_time';
  desc?: boolean;
  id?: string;
  user_id?: string;
  dsl?: boolean;
}

export interface AgentConverseParams {
  question?: string;
  stream?: boolean;
  session_id?: string;
  user_id?: string;
  sync_dsl?: boolean;
  [key: string]: any; // 其他Begin组件指定的参数
}

export interface AgentConverseResponse {
  answer: string;
  reference?: any;
  id?: string;
  session_id: string;
  param?: {
    key: string;
    name: string;
    optional: boolean;
    type: string;
    value?: string;
  }[];
} 