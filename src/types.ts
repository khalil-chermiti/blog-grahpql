export type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  posts?: [string];
};

export type Post = {
  id: string;
  author: String;
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
    age: number;
  };
};

export type UpdateUserInput = {
  id: String;
  data: {
    name?: String;
    email?: String;
    age?: number;
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
  count: [number];
  "postId:comment": [postId: string, comment: Comment];
};
