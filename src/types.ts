export type User = {
  id: string;
  name: string | null;
  email: string;
  posts?: [string];
};

export type Post = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  published: boolean;
};

export type Comment = {
  id: string;
  userId: string;
  postId: string;
  content: string;
};

export type UserInput = {
  userData: {
    name: string;
    email: string;
  };
};

export type UpdateUserInput = {
  id: string;
  data: {
    name?: string;
    email?: string;
  };
};

export type PostInput = {
  postData: {
    title: string;
    author: string;
    content: string;
    published: boolean;
  };
};

export type UpdatePostInput = {
  id: string;
  data: {
    title: string;
    content: string;
    published: boolean;
  };
};

export type CommentInput = {
  commentData: {
    userId: string;
    postId: string;
    content: string;
  };
};

export type UpdateCommentInput = {
  id: string;
  data: {
    content: string;
  };
};

export type Database = {
  users: User[];
  posts: Post[];
  comments: Comment[];
};

// types of subs
export type PubSubTypes = {
  post: [PostSubscriptionPayload];
  "postId:comment": [postId: string, comment: CommentSubscriptionPayload];
};

export type PostSubscriptionPayload = {
  mutation: "CREATED" | "DELETED" | "UPDATED";
  data: Post;
};

export type CommentSubscriptionPayload = {
  mutation: "CREATED" | "DELETED" | "UPDATED";
  data: Comment;
};
