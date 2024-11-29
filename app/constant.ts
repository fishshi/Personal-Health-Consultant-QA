export const OWNER = "fishshi";
export const REPO = "PersonalHealthConsultant-QA";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;

export const OLLAMA_BASE_URL = "http://localhost:11434";
export const YUN_BASE_URL_1 = "http://36.103.203.203:21702";
export const YUN_BASE_URL_2 = "http://";

export const ollamaModels : string[] = [
  "llama3.1"
]

export const yunModels1 : string[] = [
]

export const yunModels2 : string[] = [
]

export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2023-12", // llama3.1
  "modelName" : "cutOffDate"
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`;
export const DEFAULT_SYSTEM_TEMPLATE = `
  You are MedCu, created by 张远天. You are a helpful medical assistant.
`;

export const CACHE_URL_PREFIX = "/api/cache";
export const UPLOAD_URL = `${CACHE_URL_PREFIX}/upload`;

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  Artifacts = "/artifacts",
  SearchChat = "/search-chat",
}

export enum ApiPath {
  Cors = "",
  OpenAI = "/api/openai",
  Artifacts = "/api/artifacts",
}

export enum SlotID {
  AppBody = "app-body",
  CustomModel = "custom-model",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export enum ServiceProvider {
  OpenAI = "OpenAI",
}

export enum ModelProvider {
  GPT = "GPT",
}

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  ListModelPath: "v1/models",
};

let seq = 1000; // 内置的模型序号生成器从1000开始
export const DEFAULT_MODELS = [
  ...ollamaModels.concat(yunModels1).concat(yunModels2).map((name) => ({
    name,
    available: true,
    sorted: seq++, // Global sequence sort(index)
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
      sorted: 1, // 这里是固定的，确保顺序与之前内置的版本一致
    },
  })),
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

export const DEFAULT_GA_ID = "G-89WN60ZK2E";
