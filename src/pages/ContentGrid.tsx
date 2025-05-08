import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Linkedin, Instagram, Facebook, Youtube,
  Plus, Trash2, Edit, Copy, Calendar, Send,
  Loader2, Search, Filter, SlidersHorizontal
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
import { content } from '@/lib/api-client';
import { handleError } from '@/lib/error-handler';
import config from '@/config';

// Platform configuration
const platforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> },
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-5 w-5" /> },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-5 w-5" /> },
];

// Content item interface
interface ContentItem {
  id: string;
  platform: string;
  content: string;
  title?: string;
  createdAt: string;
  status: 'draft' | 'scheduled' | 'posted';
  scheduledFor?: string;
}

const ContentGrid: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);

  // Fetch content items
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would be an API call
        // const response = await content.getDrafts();

        // Mock data for demonstration
        const mockData: ContentItem[] = [
          {
            id: '1',
            platform: 'linkedin',
            content: 'Excited to announce our new product launch! #innovation #technology',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'draft'
          },
          {
            id: '2',
            platform: 'instagram',
            content: '✨ New collection just dropped! Check out our latest styles. #fashion #newcollection',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            status: 'scheduled',
            scheduledFor: new Date(Date.now() + 86400000).toISOString()
          },
          {
            id: '3',
            platform: 'linkedin',
            content: 'Join us for our upcoming webinar on digital marketing strategies for 2023!',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            status: 'posted'
          },
          {
            id: '4',
            platform: 'youtube',
            title: 'How to Optimize Your Social Media Strategy',
            content: 'In this video, we discuss the best practices for social media optimization...',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            status: 'draft'
          },
          {
            id: '5',
            platform: 'linkedin',
            content: "We're hiring! Check out our open positions and join our growing team.",
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            status: 'scheduled',
            scheduledFor: new Date(Date.now() + 172800000).toISOString()
          },
          {
            id: '6',
            platform: 'instagram',
            content: '🎉 Celebrating 10 years of innovation and excellence! #anniversary #celebration',
            createdAt: new Date(Date.now() - 518400000).toISOString(),
            status: 'posted'
          },
          {
            id: '7',
            platform: 'instagram',
            content: 'Customer spotlight: See how Company XYZ increased their ROI by 300% using our platform.',
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            status: 'draft'
          },
          {
            id: '8',
            platform: 'youtube',
            title: '5 Tips for Better Content Creation',
            content: 'Learn how to create engaging content that resonates with your audience...',
            createdAt: new Date(Date.now() - 691200000).toISOString(),
            status: 'scheduled',
            scheduledFor: new Date(Date.now() + 259200000).toISOString()
          }
        ];

        setContentItems(mockData);
        setFilteredItems(mockData);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Filter content based on active tab and search query
  useEffect(() => {
    let filtered = [...contentItems];

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'drafts') {
        filtered = filtered.filter(item => item.status === 'draft');
      } else if (activeTab === 'scheduled') {
        filtered = filtered.filter(item => item.status === 'scheduled');
      } else if (activeTab === 'posted') {
        filtered = filtered.filter(item => item.status === 'posted');
      } else {
        filtered = filtered.filter(item => item.platform === activeTab);
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.content.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [activeTab, searchQuery, contentItems]);

  // Handle content creation
  const handleCreateContent = () => {
    navigate('/generator');
  };

  // Handle content editing
  const handleEditContent = (id: string) => {
    navigate(`/generator?edit=${id}`);
    toast.info('Editing content...');
  };

  // Handle content deletion
  const handleDeleteContent = (id: string) => {
    try {
      // In a real app, this would be an API call
      // await content.deleteDraft(id);

      // Update local state
      setContentItems(prev => prev.filter(item => item.id !== id));
      toast.success('Content deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // Handle content duplication
  const handleDuplicateContent = (item: ContentItem) => {
    try {
      // Create a duplicate with a new ID
      const duplicate: ContentItem = {
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'draft',
        scheduledFor: undefined
      };

      // Update local state
      setContentItems(prev => [duplicate, ...prev]);
      toast.success('Content duplicated successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // Handle content scheduling
  const handleScheduleContent = (id: string) => {
    navigate(`/posts/schedule?id=${id}`);
    toast.info('Scheduling content...');
  };

  // Handle content posting
  const handlePostContent = (id: string) => {
    try {
      // In a real app, this would be an API call
      // await content.post(id);

      // Update local state
      setContentItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'posted' } : item
      ));
      toast.success('Content posted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // Get platform icon
  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.icon : null;
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

  // Render status badge
  const renderStatusBadge = (status: string, scheduledFor?: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return (
          <Badge variant="secondary">
            Scheduled for {scheduledFor ? formatDate(scheduledFor) : 'later'}
          </Badge>
        );
      case 'posted':
        return <Badge variant="default">Posted</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Grid</h1>
          <p className="text-muted-foreground">
            Manage your content across multiple platforms
          </p>
        </div>
        <Button onClick={handleCreateContent}>
          <Plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveTab('all')}>
              All Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('drafts')}>
              Drafts Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('scheduled')}>
              Scheduled Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('posted')}>
              Posted Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All</TabsTrigger>
          {platforms.map(platform => (
            <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-1">
              {platform.icon}
              <span className="hidden md:inline ml-1">{platform.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No content found</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                {searchQuery
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : "You don't have any content yet. Create your first content piece!"}
              </p>
              <Button onClick={handleCreateContent} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Content
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(item.platform)}
                        <span className="font-medium capitalize">
                          {item.platform}
                        </span>
                      </div>
                      {renderStatusBadge(item.status, item.scheduledFor)}
                    </div>
                    {item.title && (
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    )}
                    <CardDescription className="text-xs">
                      Created on {formatDate(item.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-4">
                      {item.content}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditContent(item.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateContent(item)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {item.status !== 'posted' && (
                          <DropdownMenuItem onClick={() => handleScheduleContent(item.id)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </DropdownMenuItem>
                        )}
                        {item.status !== 'posted' && (
                          <DropdownMenuItem onClick={() => handlePostContent(item.id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Post Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteContent(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {item.status === 'draft' && (
                      <Button size="sm" onClick={() => handlePostContent(item.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Post
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

export default ContentGrid;
