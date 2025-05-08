import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Filter, Search, Plus,
  Trash2, Edit, Copy, Send, Loader2,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { handleError } from '@/lib/error-handler';
import config from '@/config';

// Post status types
type PostStatus = 'scheduled' | 'posted' | 'failed';

// Post interface
interface Post {
  id: string;
  platform: string;
  content: string;
  title?: string;
  createdAt: string;
  scheduledFor: string;
  postedAt?: string;
  status: PostStatus;
}

const PostManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would be an API call
        // const response = await content.getPosts();

        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock data for demonstration
        const mockData: Post[] = [
          {
            id: '1',
            platform: 'linkedin',
            content: 'Excited to announce our new product launch! #innovation #technology',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            scheduledFor: new Date(Date.now() + 3600000).toISOString(),
            status: 'scheduled'
          },
          {
            id: '2',
            platform: 'instagram',
            content: '✨ New collection just dropped! Check out our latest styles. #fashion #newcollection',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            scheduledFor: new Date(Date.now() - 86400000).toISOString(),
            postedAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'posted'
          },
          {
            id: '3',
            platform: 'linkedin',
            content: 'Join us for our upcoming webinar on digital marketing strategies for 2023!',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            scheduledFor: new Date(Date.now() - 172800000).toISOString(),
            postedAt: new Date(Date.now() - 172800000).toISOString(),
            status: 'posted'
          },
          {
            id: '4',
            platform: 'youtube',
            title: 'How to Optimize Your Social Media Strategy',
            content: 'In this video, we discuss the best practices for social media optimization...',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            scheduledFor: new Date(Date.now() + 259200000).toISOString(),
            status: 'scheduled'
          },
          {
            id: '5',
            platform: 'linkedin',
            content: "We're hiring! Check out our open positions and join our growing team.",
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            scheduledFor: new Date(Date.now() - 345600000).toISOString(),
            status: 'failed'
          },
          {
            id: '6',
            platform: 'instagram',
            content: '🎉 Celebrating 10 years of innovation and excellence! #anniversary #celebration',
            createdAt: new Date(Date.now() - 518400000).toISOString(),
            scheduledFor: new Date(Date.now() + 86400000).toISOString(),
            status: 'scheduled'
          }
        ];

        setPosts(mockData);
        setFilteredPosts(mockData);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on active tab and search query
  useEffect(() => {
    let filtered = [...posts];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(post => post.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(query) ||
        post.title?.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(filtered);
  }, [activeTab, searchQuery, posts]);

  // Handle post creation
  const handleCreatePost = () => {
    navigate('/generator');
  };

  // Handle post editing
  const handleEditPost = (id: string) => {
    navigate(`/generator?edit=${id}`);
    toast.info('Editing post...');
  };

  // Handle post deletion
  const handleDeletePost = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await content.deletePost(id);

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Post deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // Handle post duplication
  const handleDuplicatePost = (post: Post) => {
    try {
      // Create a duplicate with a new ID
      const duplicate: Post = {
        ...post,
        id: `${post.id}-copy-${Date.now()}`,
        createdAt: new Date().toISOString(),
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        postedAt: undefined
      };

      // Update local state
      setPosts(prev => [duplicate, ...prev]);
      toast.success('Post duplicated successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // Handle post now
  const handlePostNow = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await content.postNow(id);

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      setPosts(prev => prev.map(post =>
        post.id === id ? {
          ...post,
          status: 'posted',
          postedAt: new Date().toISOString()
        } : post
      ));
      toast.success('Post published successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <span className="text-blue-600">LinkedIn</span>;
      case 'instagram':
        return <span className="text-pink-600">Instagram</span>;
      case 'youtube':
        return <span className="text-red-600">YouTube</span>;
      default:
        return <span>{platform}</span>;
    }
  };

  // Render status badge
  const renderStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Scheduled</span>
          </Badge>
        );
      case 'posted':
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3" />
            <span>Posted</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post Manager</h1>
          <p className="text-muted-foreground">
            Schedule and manage your social media posts
          </p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveTab('all')}>
              All Posts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('scheduled')}>
              Scheduled Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('posted')}>
              Posted Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('failed')}>
              Failed Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                {searchQuery
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : "You don't have any posts yet. Create your first post!"}
              </p>
              <Button onClick={handleCreatePost} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        {renderStatusBadge(post.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.scheduledFor)}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{formatTime(post.scheduledFor)}</span>
                      </div>
                    </div>
                    {post.title && (
                      <CardTitle className="text-base mt-2">{post.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">
                      {post.content}
                    </p>

                    {post.postedAt && (
                      <div className="mt-4 text-xs text-muted-foreground">
                        Posted on {formatDate(post.postedAt)} at {formatTime(post.postedAt)}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {post.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicatePost(post)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {post.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handlePostNow(post.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Post Now
                      </Button>
                    )}

                    {post.status === 'failed' && (
                      <Button size="sm" variant="outline" className="gap-2">
                        <AlertCircle className="h-4 w-4" />
                        View Error
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostManager;
