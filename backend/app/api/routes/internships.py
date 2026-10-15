"""Internships API endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.db.models import InternshipModel
from app.schemas.internship import InternshipCreate, InternshipUpdate, InternshipResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/internships", tags=["Internships"])


@router.get("", response_model=List[InternshipResponse])
def get_internships(
    query: Optional[str] = Query(None, description="Search company, role, or notes"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode (Remote, Hybrid, On-site)"),
    is_saved: Optional[bool] = Query(None, description="Filter saved internships"),
    sort_by: Optional[str] = Query("created_at", description="Sort field: created_at, deadline, company"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    q = db.query(InternshipModel)

    # Filter: show user's own records or demo/seed records
    q = q.filter(or_(InternshipModel.user_id == user_id, InternshipModel.is_demo == True))

    if query:
        search_filter = f"%{query}%"
        q = q.filter(
            or_(
                InternshipModel.company.ilike(search_filter),
                InternshipModel.role.ilike(search_filter),
                InternshipModel.location.ilike(search_filter),
                InternshipModel.description.ilike(search_filter)
            )
        )

    if work_mode and work_mode.lower() != "all":
        q = q.filter(InternshipModel.work_mode.ilike(work_mode))

    if is_saved is not None:
        q = q.filter(InternshipModel.is_saved == is_saved)

    # Sorting
    if sort_by == "deadline":
        col = InternshipModel.deadline
    elif sort_by == "company":
        col = InternshipModel.company
    else:
        col = InternshipModel.created_at

    if sort_order == "asc":
        q = q.order_by(col.asc().nullslast())
    else:
        q = q.order_by(col.desc().nullslast())

    return q.all()


@router.post("", response_model=InternshipResponse, status_code=status.HTTP_201_CREATED)
def create_internship(
    payload: InternshipCreate,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = InternshipModel(
        user_id=user_id,
        company=payload.company.strip(),
        role=payload.role.strip(),
        description=payload.description,
        location=payload.location or "Remote",
        work_mode=payload.work_mode or "Remote",
        stipend=payload.stipend,
        deadline=payload.deadline,
        job_url=payload.job_url,
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills,
        eligibility=payload.eligibility,
        notes=payload.notes,
        is_saved=payload.is_saved or False,
        is_demo=payload.is_demo or False
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{internship_id}", response_model=InternshipResponse)
def get_internship(
    internship_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = db.query(InternshipModel).filter(InternshipModel.id == internship_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID {internship_id} not found."
        )
    return record


@router.patch("/{internship_id}", response_model=InternshipResponse)
def update_internship(
    internship_id: str,
    payload: InternshipUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = db.query(InternshipModel).filter(InternshipModel.id == internship_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID {internship_id} not found."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(record, field, val)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{internship_id}", status_code=status.HTTP_200_OK)
def delete_internship(
    internship_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    record = db.query(InternshipModel).filter(InternshipModel.id == internship_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID {internship_id} not found."
        )

    db.delete(record)
    db.commit()
    return {"message": "Internship deleted successfully", "id": internship_id}
