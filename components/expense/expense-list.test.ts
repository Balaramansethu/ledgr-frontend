import { test } from 'node:test';
import assert from 'node:assert';
import type { ExpenseList as ExpenseListComponent } from '@/components/expense/expense-list';
import type { AuthProvider as AuthProviderComponent } from '@/lib/auth';
import type { ToastProvider as ToastProviderComponent } from '@/components/ui/toast';
import type { ImageViewerProvider as ImageViewerProviderComponent } from '@/components/ui/image-viewer';
import type { ExpenseDto } from '@/shared/src/types';
import type {} from '@/shared/src/index';

function makeExpense(id: string, createdAt: string, description: string): ExpenseDto {
  return {
    id,
    amount: 10,
    description,
    category: 'food',
    customCategoryKey: null,
    createdAt,
    imageUrl: null,
    recurringId: null,
    recurringPeriod: null,
  };
}

test('Home Recent activity renders a "Today" day heading above today\'s expense tile', () => {
  const nodeRequire: NodeRequire =
    (globalThis as { require?: NodeRequire }).require ?? (eval('require') as NodeRequire);

  const ModuleModule = nodeRequire('module') as {
    _resolveFilename: (request: string, ...rest: unknown[]) => string;
  };
  const originalResolve = ModuleModule._resolveFilename;
  ModuleModule._resolveFilename = function (request: string, ...rest: unknown[]): string {
    if (request === '@ledgr/shared') {
      return originalResolve.call(this, '@/shared/src/index', ...rest);
    }
    return originalResolve.call(this, request, ...rest);
  };

  const React = nodeRequire('react');
  const ReactServer = nodeRequire('react-dom/server');
  const { QueryClient, QueryClientProvider } = nodeRequire('@tanstack/react-query');
  const { ExpenseList } = nodeRequire('@/components/expense/expense-list') as {
    ExpenseList: typeof ExpenseListComponent;
  };
  const { AuthProvider } = nodeRequire('@/lib/auth') as {
    AuthProvider: typeof AuthProviderComponent;
  };
  const { ToastProvider } = nodeRequire('@/components/ui/toast') as {
    ToastProvider: typeof ToastProviderComponent;
  };
  const { ImageViewerProvider } = nodeRequire('@/components/ui/image-viewer') as {
    ImageViewerProvider: typeof ImageViewerProviderComponent;
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0);

  const expenses: ExpenseDto[] = [
    makeExpense('e1', today.toISOString(), 'Lunch today'),
    makeExpense('e2', yesterday.toISOString(), 'Lunch yesterday'),
  ];

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const tree = React.createElement(
    QueryClientProvider,
    { client },
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        ToastProvider,
        null,
        React.createElement(
          ImageViewerProvider,
          null,
          React.createElement(ExpenseList, {
            expenses,
            custom: [],
            grouped: true,
          }),
        ),
      ),
    ),
  );

  const html: string = ReactServer.renderToStaticMarkup(tree);

  assert.ok(
    html.includes('Today'),
    `SYNTHETIX_NO_DAY_HEADING: Home "Recent activity" did not render a "Today" day heading above today's expense tile. ExpenseList(grouped=true) output: ${html}`,
  );
});
