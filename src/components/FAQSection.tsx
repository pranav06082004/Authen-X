import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { use3DTilt } from "@/hooks/use3DTilt";

const faqs = [
  {
    question: "How does AuthenX detect fake news?",
    answer: "AuthenX uses advanced machine learning models trained on millions of articles to analyze linguistic patterns, source credibility, and factual consistency. Our AI evaluates multiple factors including writing style, claim verification, and cross-referencing with trusted sources."
  },
  {
    question: "What types of content can I analyze?",
    answer: "You can analyze news articles by pasting text directly or providing a URL. We also support image and video uploads for media verification. Our system works with content in multiple languages and formats."
  },
  {
    question: "How accurate is the analysis?",
    answer: "Our AI model achieves over 95% accuracy on benchmark datasets. Each analysis includes a confidence score so you can understand the certainty level. For borderline cases, we provide detailed explanations of contributing factors."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. All data is encrypted in transit and at rest. We don't store your analyzed content permanently unless you save it to your history. Your analysis history is private and only accessible to you."
  },
  {
    question: "Can I use AuthenX for free?",
    answer: "Yes! AuthenX offers a free tier that includes a generous number of daily analyses. For power users and organizations, we offer premium plans with unlimited analyses, API access, and advanced features."
  },
  {
    question: "What do the confidence scores mean?",
    answer: "Confidence scores range from 0-100%. Scores above 80% indicate high certainty in our verdict. Scores between 50-80% suggest the content has mixed signals. Below 50% means we detected significant credibility concerns."
  }
];

interface FAQItemProps {
  faq: { question: string; answer: string };
  index: number;
}

const FAQItem = ({ faq, index }: FAQItemProps) => {
  const { cardRef, containerStyle, cardStyle, tiltState, handlers } = use3DTilt({
    maxTilt: 4,
    scale: 1.01,
  });

  return (
    <div style={containerStyle}>
      <AccordionItem
        ref={cardRef}
        value={`item-${index}`}
        className="glass-card rounded-xl px-6 border-none relative z-[6]"
        style={{
          ...cardStyle,
          borderTop: tiltState.isHovered ? '2px solid rgb(251, 144, 20)' : '2px solid rgb(251, 144, 20)',
          borderRight: tiltState.isHovered ? '2px solid rgb(251, 144, 28)' : 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          boxShadow: tiltState.isHovered
            ? '0 20px 60px rgba(251, 144, 20, 0.25), 0 10px 30px rgba(0, 0, 0, 0.4), 0 -4px 20px rgba(251, 144, 20, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
        {...handlers}
      >
        <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
          {faq.question}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground pb-5">
          {faq.answer}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export const FAQSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <AnimatedSection>
          <h2 className="text-4xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to know about AuthenX
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
};
