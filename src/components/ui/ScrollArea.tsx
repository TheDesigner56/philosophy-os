'use client';

import * as RScrollArea from '@radix-ui/react-scroll-area';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface ScrollAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'> {
  viewportClassName?: string;
}

/**
 * Scrollable container with a thin, themed scrollbar that hides until interaction.
 * Works with touch (native momentum) on mobile and shows a slim track on desktop.
 */
const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, viewportClassName, children, ...props },
  ref,
) {
  return (
    <RScrollArea.Root
      ref={ref}
      type="hover"
      scrollHideDelay={600}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <RScrollArea.Viewport className={cn('h-full w-full', viewportClassName)}>
        {children}
      </RScrollArea.Viewport>
      <RScrollArea.Scrollbar
        orientation="vertical"
        className="flex touch-none select-none transition-colors p-0.5 w-2 data-[state=hidden]:opacity-0"
      >
        <RScrollArea.Thumb className="relative flex-1 rounded-full bg-white/15 hover:bg-white/25" />
      </RScrollArea.Scrollbar>
      <RScrollArea.Corner />
    </RScrollArea.Root>
  );
});

export default ScrollArea;
