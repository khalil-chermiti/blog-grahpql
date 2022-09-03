export type User = {
  id: string;
  name: string;
  email: string;
  posts?: [string];
};

export type AuthPayload = {
  data: User;
  token: string;
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
    password: string;
  };
};

export type UserLoginInput = {
  loginData : {
    email: string ;
    password: string;
  }
}

export type UpdateUserInput = {
  data: {
    name?: string;
    email?: string;
  };
};

export type PostInput = {
  postData: {
    title: string;
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

// declaring types for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      DATABASE_URL: string;
    }
  }
}
