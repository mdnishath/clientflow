# 🛠️ Developer Guide - Best Practices

## Table of Contents
1. [Error Handling](#error-handling)
2. [Logging](#logging)
3. [Memory Management](#memory-management)
4. [Performance Tips](#performance-tips)

---

## 1. Error Handling

### Using Error Boundaries

#### Global Error Boundary (Already Set Up)
The entire app is wrapped in an ErrorBoundary at the root level. All React component errors are automatically caught.

#### Page-Level Error Boundaries
For additional granularity, wrap specific pages:

```typescript
import { ErrorBoundary } from "@/components/error-boundary";

export default function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### Custom Error Fallback
```typescript
<ErrorBoundary
  fallback={
    <div>
      <h1>Oops! Custom error message</h1>
      <button onClick={retry}>Try Again</button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

#### With Custom Error Handler
```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to error tracking service
    console.error("Error caught:", error, errorInfo);
    // Or use logger
    logger.error("Component error", error, "ErrorBoundary");
  }}
>
  <MyComponent />
</ErrorBoundary>
```

#### HOC Pattern
```typescript
import { withErrorBoundary } from "@/components/error-boundary";

const MyComponent = () => { /* ... */ };

export default withErrorBoundary(MyComponent);
```

---

## 2. Logging

### Basic Usage

#### Replace console.log
❌ **Bad:**
```typescript
console.log("User logged in:", userId);
console.error("API failed", error);
```

✅ **Good:**
```typescript
import { logger } from "@/lib/logger";

logger.info("User logged in", { userId });
logger.error("API failed", error, "API");
```

### Log Levels

```typescript
import { logger } from "@/lib/logger";

// Development only - detailed debugging info
logger.debug("Function called", { params }, "FunctionName");

// General information
logger.info("User action completed", { userId, action });

// Warning - something unexpected but not breaking
logger.warn("Slow API response", { duration: 5000 }, "Performance");

// Error - something went wrong
logger.error("Failed to save data", error, "Database");

// Fatal - critical system failure
logger.fatal("Database connection lost", error, "Critical");
```

### Specialized Logging Helpers

#### API Logging
```typescript
import { logApi } from "@/lib/logger";

// Log API request
logApi.request("POST", "/api/reviews", { reviewId: "123" });

// Log API response
logApi.response("POST", "/api/reviews", 200, { success: true });

// Log API error
logApi.error("POST", "/api/reviews", new Error("Network timeout"));
```

#### Authentication Logging
```typescript
import { logAuth } from "@/lib/logger";

// Log login
logAuth.login(userId);

// Log logout
logAuth.logout(userId);

// Log auth failure
logAuth.failed("Invalid credentials");
```

#### Automation Logging
```typescript
import { logAutomation } from "@/lib/logger";

// Log automation start
logAutomation.start(100, 5); // 100 reviews, 5 threads

// Log progress
logAutomation.progress(50, 100); // 50 completed out of 100

// Log completion
logAutomation.complete({ live: 80, missing: 20 });

// Log error
logAutomation.error(new Error("Browser crashed"));
```

### Performance Timing

```typescript
import { logger } from "@/lib/logger";

// Start timer
logger.time("DatabaseQuery");

// ... your code ...

// End timer (will log duration)
logger.timeEnd("DatabaseQuery");
```

### Utility Functions

```typescript
import { logger } from "@/lib/logger";

// Get recent logs (for debugging UI)
const recentLogs = logger.getRecentLogs(100);

// Export logs (for support tickets)
const logsJson = logger.exportLogs();

// Clear logs (for testing)
logger.clearLogs();
```

---

## 3. Memory Management

### Best Practices for Hooks

#### Always Cleanup Effects
✅ **Good:**
```typescript
useEffect(() => {
  const eventSource = new EventSource("/api/events");
  const interval = setInterval(doSomething, 1000);
  const timeout = setTimeout(doSomethingLater, 5000);

  // ALWAYS return cleanup function
  return () => {
    eventSource.close();
    clearInterval(interval);
    clearTimeout(timeout);
  };
}, []);
```

#### AbortController for Fetch Requests
✅ **Good:**
```typescript
useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/data", {
        signal: abortController.signal,
      });
      // handle response
    } catch (error) {
      if (error.name === "AbortError") {
        // Request was cancelled, ignore
        return;
      }
      logger.error("Fetch failed", error);
    }
  };

  fetchData();

  return () => {
    abortController.abort();
  };
}, []);
```

#### EventSource Cleanup
✅ **Good:**
```typescript
useEffect(() => {
  const eventSource = new EventSource("/api/sse");

  eventSource.onmessage = (event) => {
    // handle message
  };

  eventSource.onerror = () => {
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}, []);
```

#### RequestAnimationFrame Cleanup
✅ **Good:**
```typescript
useEffect(() => {
  let rafId: number;

  const animate = () => {
    // animation logic
    rafId = requestAnimationFrame(animate);
  };

  rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
  };
}, []);
```

---

## 4. Performance Tips

### React.memo for Expensive Components

```typescript
import React from "react";

interface ReviewCardProps {
  review: Review;
  onUpdate: (id: string) => void;
}

// Wrap component in React.memo
export const ReviewCard = React.memo(
  ({ review, onUpdate }: ReviewCardProps) => {
    return (
      <div>
        {/* component JSX */}
      </div>
    );
  },
  // Custom comparison function (optional)
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return (
      prevProps.review.id === nextProps.review.id &&
      prevProps.review.status === nextProps.review.status
    );
  }
);
```

### useMemo for Expensive Calculations

```typescript
import { useMemo } from "react";

const MyComponent = ({ reviews }) => {
  // Expensive calculation - only recalculate when reviews change
  const sortedReviews = useMemo(() => {
    return reviews
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100);
  }, [reviews]);

  return <div>{/* render sortedReviews */}</div>;
};
```

### useCallback for Stable Functions

```typescript
import { useCallback } from "react";

const MyComponent = () => {
  // Function reference stays the same across re-renders
  const handleClick = useCallback((id: string) => {
    logger.info("Button clicked", { id });
    // handle click
  }, []); // Dependencies

  return <Button onClick={() => handleClick("123")} />;
};
```

### Virtualization for Long Lists

```typescript
import { VirtualizedReviewList } from "@/components/reviews/virtualized-review-list";

// Instead of rendering 1000 items:
<div>
  {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
</div>

// Use virtualization:
<VirtualizedReviewList
  reviews={reviews}
  height={600}
  itemHeight={100}
/>
```

---

## 🎯 Quick Reference

### When to Use What

| Scenario | Use |
|----------|-----|
| Catch React errors | `<ErrorBoundary>` |
| Log information | `logger.info()` |
| Log errors | `logger.error()` |
| Cleanup effects | `return () => { /* cleanup */ }` |
| Cancel requests | `AbortController` |
| Close connections | `eventSource.close()` |
| Prevent re-renders | `React.memo()` |
| Cache calculations | `useMemo()` |
| Stable functions | `useCallback()` |
| Long lists | Virtualization |

---

## 📚 Additional Resources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [React.memo](https://react.dev/reference/react/memo)
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

**Last Updated:** February 12, 2026
