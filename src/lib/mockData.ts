import type { UserLevel } from "@/components/UserBadge";

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorLevel: UserLevel;
  authorUnit: string;
  boardType: "notice" | "free" | "market" | "complaint";
  createdAt: string;
  views: number;
  commentCount: number;
  likes: number;
  pinned?: boolean;
  urgent?: boolean;
  // Market specific
  price?: number;
  status?: "판매중" | "예약중" | "판매완료";
  images?: string[];
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  authorLevel: UserLevel;
  authorUnit: string;
  content: string;
  createdAt: string;
  likes: number;
  isAuthor?: boolean;
  parentId?: number | null;
  reactions: { emoji: string; count: number; reacted: boolean }[];
}

export const mockPosts: Post[] = [
  {
    id: 1, title: "⚡ [긴급] 3월 10일(월) 단수 안내", content: "3월 10일 오전 9시~오후 3시까지 수도시설 정비로 인한 단수가 예정되어 있습니다. 미리 생활용수를 확보해 주시기 바랍니다.",
    author: "관리사무소", authorLevel: 3, authorUnit: "관리동", boardType: "notice",
    createdAt: "2026-03-08 09:00", views: 342, commentCount: 15, likes: 0, pinned: true, urgent: true,
  },
  {
    id: 2, title: "3월 관리비 부과 안내", content: "3월 관리비가 부과되었습니다. 납부 기한은 3월 25일입니다.",
    author: "관리사무소", authorLevel: 3, authorUnit: "관리동", boardType: "notice",
    createdAt: "2026-03-07 14:00", views: 198, commentCount: 3, likes: 0, pinned: true,
  },
  {
    id: 3, title: "단지 앞 새로 생긴 카페 후기 ☕", content: "정문 앞에 새로 오픈한 '숲속카페' 다녀왔어요! 아메리카노가 2,500원인데 맛있네요. 키즈존도 있어서 아이들 데리고 가기 좋아요.",
    author: "커피러버", authorLevel: 1, authorUnit: "103동 802호", boardType: "free",
    createdAt: "2026-03-08 11:30", views: 89, commentCount: 12, likes: 24,
  },
  {
    id: 4, title: "봄맞이 베란다 화분 공동구매 하실 분!", content: "라벤더, 로즈마리, 바질 등 허브 모종 공동구매 모집합니다. 10명 이상 모이면 개당 3,000원에 가능해요!",
    author: "초록손", authorLevel: 1, authorUnit: "105동 301호", boardType: "free",
    createdAt: "2026-03-07 16:20", views: 67, commentCount: 8, likes: 31,
  },
  {
    id: 5, title: "다이슨 청소기 V10 팝니다", content: "2년 사용한 다이슨 V10 판매합니다. 배터리 상태 양호하고 부속품 전부 포함입니다. 직거래만 가능합니다.",
    author: "깔끔맘", authorLevel: 1, authorUnit: "102동 1201호", boardType: "market",
    createdAt: "2026-03-08 10:00", views: 43, commentCount: 5, likes: 0,
    price: 150000, status: "판매중",
  },
  {
    id: 6, title: "아이 자전거 나눔합니다 🚲", content: "16인치 아동용 자전거 나눔합니다. 사용감은 있지만 기능 이상 없어요. 1층 경비실 앞에서 가져가시면 됩니다.",
    author: "나눔천사", authorLevel: 1, authorUnit: "101동 501호", boardType: "market",
    createdAt: "2026-03-07 09:00", views: 78, commentCount: 11, likes: 0,
    price: 0, status: "예약중",
  },
  {
    id: 7, title: "엘리베이터 소음이 너무 심합니다", content: "101동 엘리베이터에서 이상한 소음이 계속 나고 있습니다. 안전 점검 부탁드립니다.",
    author: "익명주민", authorLevel: 1, authorUnit: "101동", boardType: "complaint",
    createdAt: "2026-03-06 22:10", views: 15, commentCount: 1, likes: 0,
  },
  {
    id: 8, title: "인테리어 꿀팁 공유 - 작은 방 넓어보이는 법", content: "밝은 색 가구와 거울 활용하면 작은 방도 넓어 보여요! 사진 첨부합니다.",
    author: "인테리어왕", authorLevel: 1, authorUnit: "104동 903호", boardType: "free",
    createdAt: "2026-03-06 18:00", views: 156, commentCount: 21, likes: 45,
  },
];

export const mockComments: Comment[] = [
  {
    id: 1, postId: 3, author: "커피러버", authorLevel: 1, authorUnit: "103동 802호",
    content: "가격도 착하고 분위기도 좋았어요!", createdAt: "2026-03-08 12:00", likes: 5, isAuthor: true, parentId: null,
    reactions: [{ emoji: "👍", count: 5, reacted: false }, { emoji: "❤️", count: 3, reacted: true }],
  },
  {
    id: 2, postId: 3, author: "맛집러", authorLevel: 1, authorUnit: "102동 1103호",
    content: "오 저도 가봐야겠네요~ 위치가 정확히 어디인가요?", createdAt: "2026-03-08 12:15", likes: 2, parentId: null,
    reactions: [{ emoji: "👍", count: 2, reacted: false }],
  },
  {
    id: 3, postId: 3, author: "커피러버", authorLevel: 1, authorUnit: "103동 802호",
    content: "정문 나가서 오른쪽으로 50m 정도 가시면 있어요! 간판이 초록색이라 잘 보여요.", createdAt: "2026-03-08 12:20", likes: 3, isAuthor: true, parentId: 2,
    reactions: [{ emoji: "🙏", count: 4, reacted: false }],
  },
  {
    id: 4, postId: 3, author: "단지주민", authorLevel: 2, authorUnit: "101동 201호",
    content: "좋은 정보 감사합니다! 주말에 가봐야겠어요.", createdAt: "2026-03-08 13:00", likes: 1, parentId: null,
    reactions: [{ emoji: "😊", count: 1, reacted: false }],
  },
];

export function getPostsByBoard(boardType: string) {
  return mockPosts.filter(p => p.boardType === boardType);
}

export function getPostById(id: number) {
  return mockPosts.find(p => p.id === id);
}

export function getCommentsByPostId(postId: number) {
  return mockComments.filter(c => c.postId === postId);
}
