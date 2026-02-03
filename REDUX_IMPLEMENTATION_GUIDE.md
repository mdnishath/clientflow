# Redux Implementation Guide for Real-Time Review Checking

## ✅ What's Done:

1. **Redux Store** - Already exists at `src/lib/store.ts`
2. **Reviews Slice Updated** - Added checking status management:
   - `checkingIds` - Array of review IDs being checked (optimistic)
   - `startCheckingReviews` - Mark reviews as checking immediately
   - `updateCheckStatus` - Update individual review status from database
   - `clearCheckingStatuses` - Clear all checking statuses
   - `setAutoRefreshing` - Track auto-refresh state

3. **Typed Hooks** - Created at `src/lib/hooks.ts`

## 🔧 How to Use in Reviews Page:

### 1. Import Redux hooks and actions:
```typescript
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  startCheckingReviews,
  updateCheckStatus,
  fetchReviews,
  setAutoRefreshing,
} from "@/lib/features/reviewsSlice";
```

### 2. Replace local state with Redux:
```typescript
// OLD - Remove these:
const [reviews, setReviews] = useState<Review[]>([]);
const [checkingReviewIds, setCheckingReviewIds] = useState<Set<string>>(new Set());

// NEW - Use Redux:
const dispatch = useAppDispatch();
const reviews = useAppSelector((state) => state.reviews.items);
const checkingIds = useAppSelector((state) => state.reviews.checkingIds);
const isAutoRefreshing = useAppSelector((state) => state.reviews.isAutoRefreshing);
```

### 3. Dispatch actions instead of setState:
```typescript
// When live check starts (INSTANT):
const handleLiveCheckStart = (reviewIds: string[]) => {
  console.log("🚀 Starting check for:", reviewIds);
  dispatch(startCheckingReviews(reviewIds)); // INSTANT UI update!
};

// When polling gets updates:
useEffect(() => {
  const pollAndUpdate = async () => {
    // Fetch reviews
    await dispatch(fetchReviews({ page, status: statusFilter, search }));

    // Check for status changes
    reviews.forEach((review) => {
      if (review.checkStatus && review.checkStatus !== "CHECKING") {
        // Update Redux when check completes
        dispatch(updateCheckStatus({
          id: review.id,
          checkStatus: review.checkStatus,
          lastCheckedAt: review.lastCheckedAt,
        }));
      }
    });
  };

  // Poll every 400ms when checks active
  const interval = setInterval(pollAndUpdate, 400);
  return () => clearInterval(interval);
}, [/* deps */]);
```

### 4. Check if review is being checked:
```typescript
{reviews.map((review) => {
  // Check BOTH database status AND optimistic state
  const isChecking = review.checkStatus === "CHECKING" ||
                     checkingIds.includes(review.id);

  return (
    <Card className={isChecking ? "ring-2 ring-blue-500 animate-pulse" : ""}>
      {isChecking && (
        <Badge className="bg-blue-600 animate-pulse">
          <Loader2 className="animate-spin" />
          Checking this review now...
        </Badge>
      )}
      {/* Rest of card */}
    </Card>
  );
})}
```

## 🎯 Benefits:

✅ **Instant Feedback** - Cards show CHECKING immediately when clicked
✅ **Real-Time Updates** - Redux auto-removes from checking when status changes
✅ **No State Conflicts** - Single source of truth
✅ **Redux DevTools** - Debug state changes easily
✅ **Cleaner Code** - No manual state synchronization

## 🚀 Next Steps:

1. Update `reviews/page.tsx` to use Redux hooks
2. Update `LiveCheckButton` to dispatch `startCheckingReviews`
3. Update polling logic to dispatch `updateCheckStatus`
4. Test with Redux DevTools to see state changes in real-time!

**Redux is ready to use!** Just replace local state with Redux selectors and dispatch actions.
