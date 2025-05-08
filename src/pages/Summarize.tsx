import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/layout/PageHeader';
import TextSummarizer from '@/components/summarization/TextSummarizer';

/**
 * Summarization page component
 */
const SummarizePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Text Summarization | SocialMuse</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader
          title="Text Summarization"
          description="Summarize long text using Llama 3.1 from Groq"
        />
        <div className="bg-card rounded-lg shadow-sm p-6">
          <TextSummarizer />
        </div>
      </div>
    </>
  );
};

export default SummarizePage;
