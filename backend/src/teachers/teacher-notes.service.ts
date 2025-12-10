import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeacherNote, TeacherNoteDocument } from '../schemas/teacher-note.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class TeacherNotesService {
  private readonly logger = new Logger(TeacherNotesService.name);

  constructor(
    @InjectModel(TeacherNote.name)
    private teacherNoteModel: Model<TeacherNoteDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create note for student
   */
  async createNote(noteData: {
    teacherId: string;
    studentId: string;
    note: string;
    noteType: 'observation' | 'concern' | 'achievement' | 'parent_contact' | 'intervention' | 'follow_up';
    tags?: string[];
    isPrivate?: boolean;
    followUpDate?: Date;
  }): Promise<TeacherNoteDocument> {
    const newNote = new this.teacherNoteModel({
      ...noteData,
      teacherId: new Types.ObjectId(noteData.teacherId),
      studentId: new Types.ObjectId(noteData.studentId),
    });

    await newNote.save();
    this.logger.log(`Note created for student ${noteData.studentId} by teacher ${noteData.teacherId}`);

    return newNote;
  }

  /**
   * Get all notes for a student
   */
  async getStudentNotes(
    teacherId: string,
    studentId: string,
    filters?: {
      noteType?: string;
      tags?: string[];
      onlyPending?: boolean;
    },
  ): Promise<TeacherNoteDocument[]> {
    const query: any = {
      teacherId: new Types.ObjectId(teacherId),
      studentId: new Types.ObjectId(studentId),
    };

    if (filters?.noteType) {
      query.noteType = filters.noteType;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters?.onlyPending) {
      query.followUpDate = { $ne: null };
      query.followUpCompleted = false;
    }

    return this.teacherNoteModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all notes for teacher (across all students)
   */
  async getAllNotes(
    teacherId: string,
    limit: number = 50,
  ): Promise<TeacherNoteDocument[]> {
    return this.teacherNoteModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('studentId', 'fullName username')
      .exec();
  }

  /**
   * Get pending follow-ups for teacher
   */
  async getPendingFollowUps(teacherId: string): Promise<TeacherNoteDocument[]> {
    return this.teacherNoteModel
      .find({
        teacherId: new Types.ObjectId(teacherId),
        followUpDate: { $ne: null, $lte: new Date() },
        followUpCompleted: false,
      })
      .sort({ followUpDate: 1 })
      .populate('studentId', 'fullName username')
      .exec();
  }

  /**
   * Mark follow-up as completed
   */
  async completeFollowUp(
    teacherId: string,
    noteId: string,
  ): Promise<TeacherNoteDocument> {
    const note = await this.teacherNoteModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(noteId),
        teacherId: new Types.ObjectId(teacherId),
      },
      { $set: { followUpCompleted: true } },
      { new: true },
    );

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    this.logger.log(`Follow-up completed for note ${noteId}`);

    return note;
  }

  /**
   * Update note
   */
  async updateNote(
    teacherId: string,
    noteId: string,
    updates: {
      note?: string;
      tags?: string[];
      followUpDate?: Date;
      isPrivate?: boolean;
    },
  ): Promise<TeacherNoteDocument> {
    const note = await this.teacherNoteModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(noteId),
        teacherId: new Types.ObjectId(teacherId),
      },
      { $set: updates },
      { new: true },
    );

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  /**
   * Delete note
   */
  async deleteNote(teacherId: string, noteId: string): Promise<void> {
    const result = await this.teacherNoteModel.deleteOne({
      _id: new Types.ObjectId(noteId),
      teacherId: new Types.ObjectId(teacherId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Note not found');
    }

    this.logger.log(`Note ${noteId} deleted by teacher ${teacherId}`);
  }

  /**
   * Get note statistics for teacher
   */
  async getNoteStatistics(teacherId: string): Promise<{
    totalNotes: number;
    pendingFollowUps: number;
    notesByType: Record<string, number>;
    recentTags: string[];
  }> {
    const notes = await this.teacherNoteModel.find({
      teacherId: new Types.ObjectId(teacherId),
    });

    const pendingFollowUps = await this.teacherNoteModel.countDocuments({
      teacherId: new Types.ObjectId(teacherId),
      followUpDate: { $ne: null, $lte: new Date() },
      followUpCompleted: false,
    });

    const notesByType: Record<string, number> = {};
    const tagFrequency: Record<string, number> = {};

    notes.forEach((note) => {
      notesByType[note.noteType] = (notesByType[note.noteType] || 0) + 1;

      note.tags.forEach((tag) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    // Get top 10 most used tags
    const recentTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);

    return {
      totalNotes: notes.length,
      pendingFollowUps,
      notesByType,
      recentTags,
    };
  }
}
