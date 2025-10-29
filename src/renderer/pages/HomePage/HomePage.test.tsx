import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomePage } from './HomePage';
import { useProjectStore } from '@/renderer/stores/projectStore';

// Mock IPC
const mockIpcInvoke = vi.fn();
(window as any).electron = {
  ipcRenderer: {
    invoke: mockIpcInvoke
  }
};

vi.mock('@/renderer/stores/projectStore');

describe('HomePage', () => {
  beforeEach(() => {
    mockIpcInvoke.mockClear();
    (useProjectStore as any).mockReturnValue({
      recentProjects: [],
      loadProject: vi.fn(),
      createNewProject: vi.fn()
    });
  });

  describe('Rendering', () => {
    it('should render all required elements', () => {
      // When
      render(<HomePage />);

      // Then
      expect(screen.getByTestId('new-project-btn')).toBeInTheDocument();
      expect(screen.getByTestId('load-project-btn')).toBeInTheDocument();
      expect(screen.getByTestId('api-settings-btn')).toBeInTheDocument();
      expect(screen.getByText('建立新專案')).toBeInTheDocument();
      expect(screen.getByText('載入專案')).toBeInTheDocument();
    });

    it('should render recent projects list', () => {
      // Given
      (useProjectStore as any).mockReturnValue({
        recentProjects: [
          {
            projectId: '550e8400-e29b-41d4-a716-446655440000',
            projectName: '專案 1',
            updatedAt: '2025-10-29T10:00:00Z'
          },
          {
            projectId: '550e8400-e29b-41d4-a716-446655440001',
            projectName: '專案 2',
            updatedAt: '2025-10-29T11:00:00Z'
          }
        ],
        loadProject: vi.fn(),
        createNewProject: vi.fn()
      });

      // When
      render(<HomePage />);

      // Then
      expect(screen.getByText('專案 1')).toBeInTheDocument();
      expect(screen.getByText('專案 2')).toBeInTheDocument();
    });

    it('should render maximum 3 recent projects', () => {
      // Given
      (useProjectStore as any).mockReturnValue({
        recentProjects: [
          { projectId: '1', projectName: '專案 1', updatedAt: '2025-10-29T10:00:00Z' },
          { projectId: '2', projectName: '專案 2', updatedAt: '2025-10-29T11:00:00Z' },
          { projectId: '3', projectName: '專案 3', updatedAt: '2025-10-29T12:00:00Z' },
          { projectId: '4', projectName: '專案 4', updatedAt: '2025-10-29T13:00:00Z' }
        ],
        loadProject: vi.fn(),
        createNewProject: vi.fn()
      });

      // When
      render(<HomePage />);

      // Then
      expect(screen.getByText('專案 1')).toBeInTheDocument();
      expect(screen.getByText('專案 2')).toBeInTheDocument();
      expect(screen.getByText('專案 3')).toBeInTheDocument();
      expect(screen.queryByText('專案 4')).not.toBeInTheDocument();
    });
  });

  describe('Interactions - Load Project', () => {
    it('should call file:select when load project button is clicked', async () => {
      // Given
      mockIpcInvoke.mockResolvedValue({
        filePath: '/path/to/project.json',
        canceled: false
      });
      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockIpcInvoke).toHaveBeenCalledWith('file:select', {
          title: '選擇專案檔案',
          filters: [{ name: '專案檔案', extensions: ['json'] }]
        });
      });
    });

    it('should load project when file is selected', async () => {
      // Given
      const mockProjectData = {
        version: '1.0',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        projectName: '測試專案',
        createdAt: '2025-10-29T10:00:00Z',
        updatedAt: '2025-10-29T10:00:00Z',
        currentStage: 'script-input',
        scriptContent: '測試文稿',
        settings: {
          voiceId: 'zh-TW-HsiaoChenNeural',
          outputPath: '/home/user/Documents'
        }
      };

      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: JSON.stringify(mockProjectData), error: undefined });

      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockIpcInvoke).toHaveBeenCalledWith('file:read', {
          path: '/path/to/project.json'
        });
      });

      await waitFor(() => {
        expect(mockLoadProject).toHaveBeenCalledWith(mockProjectData);
      });
    });

    it('should show error message when file read fails', async () => {
      // Given
      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: undefined, error: '檔案不存在' });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(screen.getByText('檔案不存在')).toBeInTheDocument();
      });
    });

    it('should show error message when file format is invalid', async () => {
      // Given
      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: 'invalid json', error: undefined });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(screen.getByText('檔案格式錯誤')).toBeInTheDocument();
      });
    });

    it('should not load project when dialog is canceled', async () => {
      // Given
      mockIpcInvoke.mockResolvedValue({ filePath: undefined, canceled: true });
      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockLoadProject).not.toHaveBeenCalled();
      });
    });
  });

  describe('Interactions - New Project', () => {
    it('should call createNewProject when new project button is clicked', async () => {
      // Given
      const mockCreateNewProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: vi.fn(),
        createNewProject: mockCreateNewProject
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('new-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockCreateNewProject).toHaveBeenCalled();
      });
    });
  });

  describe('Interactions - Recent Projects', () => {
    it('should load project when clicking on recent project card', async () => {
      // Given
      const mockProjectData = {
        version: '1.0',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        projectName: '專案 1',
        createdAt: '2025-10-29T10:00:00Z',
        updatedAt: '2025-10-29T10:00:00Z',
        currentStage: 'script-input',
        scriptContent: '測試文稿',
        settings: {
          voiceId: 'zh-TW-HsiaoChenNeural',
          outputPath: '/home/user/Documents'
        }
      };

      const recentProject = {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        projectName: '專案 1',
        updatedAt: '2025-10-29T10:00:00Z',
        filePath: '/path/to/project1.json'
      };

      mockIpcInvoke.mockResolvedValue({
        content: JSON.stringify(mockProjectData),
        error: undefined
      });

      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [recentProject],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByText('專案 1'));

      // Then
      await waitFor(() => {
        expect(mockIpcInvoke).toHaveBeenCalledWith('file:read', {
          path: '/path/to/project1.json'
        });
      });

      await waitFor(() => {
        expect(mockLoadProject).toHaveBeenCalledWith(mockProjectData);
      });
    });
  });

  describe('Validation', () => {
    it('should validate projectName is not empty', async () => {
      // Given
      const mockProjectData = {
        version: '1.0',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        projectName: '',
        createdAt: '2025-10-29T10:00:00Z',
        updatedAt: '2025-10-29T10:00:00Z',
        currentStage: 'script-input',
        scriptContent: '測試文稿',
        settings: {
          voiceId: 'zh-TW-HsiaoChenNeural',
          outputPath: '/home/user/Documents'
        }
      };

      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: JSON.stringify(mockProjectData), error: undefined });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(screen.getByText('專案名稱不能為空')).toBeInTheDocument();
      });
    });

    it('should validate projectName is not too long', async () => {
      // Given
      const longName = 'a'.repeat(101);
      const mockProjectData = {
        version: '1.0',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        projectName: longName,
        createdAt: '2025-10-29T10:00:00Z',
        updatedAt: '2025-10-29T10:00:00Z',
        currentStage: 'script-input',
        scriptContent: '測試文稿',
        settings: {
          voiceId: 'zh-TW-HsiaoChenNeural',
          outputPath: '/home/user/Documents'
        }
      };

      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: JSON.stringify(mockProjectData), error: undefined });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(screen.getByText('專案名稱最多 100 字')).toBeInTheDocument();
      });
    });
  });
});
