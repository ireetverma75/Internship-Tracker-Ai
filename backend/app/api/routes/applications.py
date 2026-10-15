"""Applications CRUD API endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.db.models import ApplicationModel
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (Saved, Applied, Interview, etc.)"),
    query: Optional[str] = Query(None, description="Search company or role"),
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    q = db.query(ApplicationModel)
    q = q.filter(or_(ApplicationModel.user_id == user_id, ApplicationModel.user_id.is_(None), ApplicationModel.user_id == "demo-user-default"))

    if status_filter and status_filter.lower() != "all":
        q = q.filter(ApplicationModel.status == status_filter)

    if query:
        search_filter = f"%{query}%"
        q = q.filter(
            or_(
                ApplicationModel.company.ilike(search_filter),
                ApplicationModel.role.ilike(search_filter),
                ApplicationModel.notes.ilike(search_filter)
            )
        )

    return q.order_by(ApplicationModel.created_at.desc()).all()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = ApplicationModel(
        user_id=user_id,
        internship_id=payload.internship_id,
        company=payload.company.strip(),
        role=payload.role.strip(),
        status=payload.status,
        applied_date=payload.applied_date,
        interview_date=payload.interview_date,
        deadline=payload.deadline,
        match_score=payload.match_score,
        next_action=payload.next_action,
        notes=payload.notes,
        job_url=payload.job_url
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )
    return record


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(record, field, val)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{application_id}", status_code=status.HTTP_200_OK)
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found."
        )

    db.delete(record)
    db.commit()
    return {"message": "Application deleted successfully", "id": application_id}
