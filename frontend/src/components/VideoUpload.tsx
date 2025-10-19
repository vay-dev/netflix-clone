import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoService } from '../services/videoService';
import type { VideoFormData, Genre } from '../interfaces/video.interface';
import { Upload, Film, FileText, Calendar, User as UserIcon, Star, Image, Video as VideoIcon, AlertCircle, CheckCircle } from 'lucide-react';
import './styles/videoUpload.scss';

const VideoUpload = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    release_date: '',
    producer: '',
    star_actors: '',
    thumbnail: null,
    video_file: null,
    genres: [],
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await videoService.getGenres();
        setGenres(genresData);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });

      // Create thumbnail preview
      if (name === 'thumbnail') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(files[0]);
      }
    }
    setError('');
  };

  const handleGenreToggle = (genreId: number) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.thumbnail) {
      setError('Please upload a thumbnail image');
      setLoading(false);
      return;
    }

    if (!formData.video_file) {
      setError('Please upload a video file');
      setLoading(false);
      return;
    }

    try {
      await videoService.createVideo(formData);
      setSuccess(true);

      // Reset form
      setFormData({
        title: '',
        description: '',
        release_date: '',
        producer: '',
        star_actors: '',
        thumbnail: null,
        video_file: null,
        genres: [],
      });
      setThumbnailPreview('');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="video-upload-container">
      <div className="video-upload-box">
        <div className="upload-header">
          <Upload className="upload-icon" size={40} />
          <h1 className="upload-title">Upload Video</h1>
          <p className="upload-subtitle">Add a new video to the platform</p>
        </div>

        {error && (
          <div className="upload-message upload-message--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="upload-message upload-message--success">
            <CheckCircle size={18} />
            <span>Video uploaded successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                <Film size={16} />
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="release_date" className="form-label">
                <Calendar size={16} />
                Release Date *
              </label>
              <input
                type="date"
                id="release_date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <FileText size={16} />
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter video description"
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="producer" className="form-label">
                <UserIcon size={16} />
                Producer *
              </label>
              <input
                type="text"
                id="producer"
                name="producer"
                value={formData.producer}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter producer name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="star_actors" className="form-label">
                <Star size={16} />
                Star Actors *
              </label>
              <input
                type="text"
                id="star_actors"
                name="star_actors"
                value={formData.star_actors}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter actor names (comma separated)"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Star size={16} />
              Genres
            </label>
            <div className="genre-grid">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreToggle(genre.id)}
                  className={`genre-button ${formData.genres.includes(genre.id) ? 'selected' : ''}`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="thumbnail" className="form-label">
                <Image size={16} />
                Thumbnail Image *
              </label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                onChange={handleFileChange}
                className="form-input-file"
                accept="image/*"
                required
              />
              {thumbnailPreview && (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="video_file" className="form-label">
                <VideoIcon size={16} />
                Video File *
              </label>
              <input
                type="file"
                id="video_file"
                name="video_file"
                onChange={handleFileChange}
                className="form-input-file"
                accept="video/*"
                required
              />
              {formData.video_file && (
                <div className="file-info">
                  <p>Selected: {formData.video_file.name}</p>
                  <p>Size: {(formData.video_file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="upload-submit"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
